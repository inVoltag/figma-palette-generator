import * as React from 'react';
import { lightness } from '../data';

interface Props {
  knobsList: string;
  type: string;
  min: string;
  max: string;
  scale: string
};

export default class Slider extends React.Component<Props> {

  constructor(props) {
    super(props)
    this.state = {
      id: null,
      value: null
    }
  }

  doMap = (value, oldMin, oldMax, newMin, newMax) => {
    const oldRange = oldMax - oldMin,
        newRange = newMax - newMin
    return ((value - oldMin) * newRange / oldRange) + newMin
  }

  // Events
  onSlide = (e: any) => {
    const knob = e.target,
          range = knob.parentElement,
          shift = e.nativeEvent.layerX,
          tooltip = knob.children[0],
          rangeWidth = range.offsetWidth,
          knobs = Array.from(range.childNodes as HTMLCollectionOf<HTMLElement>);

    let offset;
    knob.style.zIndex = 2;

    const slide = (e) => {
      let limitMin, limitMax;
      const gap = this.doMap(2, 0, 100, 0, rangeWidth);
      offset = e.clientX - range.offsetLeft - shift;

      lightness.min = parseFloat(this.doMap(range.lastChild.offsetLeft, 0, rangeWidth, 0, 100).toFixed(1));
      lightness.max = parseFloat(this.doMap(range.firstChild.offsetLeft, 0, rangeWidth, 0, 100).toFixed(1));

      if (knob == range.lastChild) { // 900
        limitMin = 0;
        limitMax = knob.previousElementSibling.offsetLeft - gap
      } else if (knob == range.firstChild) { // 50
        limitMin = knob.nextElementSibling.offsetLeft + gap;
        limitMax = rangeWidth
      } else {
        limitMin = knob.nextElementSibling.offsetLeft + gap;
        limitMax = knob.previousElementSibling.offsetLeft - gap
      }

      if (offset <= limitMin)
        offset = limitMin
      else if (offset >= limitMax)
        offset = limitMax;

      // distribute knobs horizontal spacing
      if (knob == range.lastChild && e.shiftKey == true) // 900
        this.distributeKnobs('MIN', this.doMap(offset, 0, rangeWidth, 0, 100).toFixed(1), knobs)
      else if (knob == range.firstChild && e.shiftKey == true) // 50
        this.distributeKnobs('MAX', this.doMap(offset, 0, rangeWidth, 0, 100).toFixed(1), knobs)

      // link every knob
      if (e.ctrlKey == true || e.metaKey == true) {
        if (offset <= (knob.offsetLeft - range.lastChild.offsetLeft) || offset > (rangeWidth - range.firstChild.offsetLeft + knob.offsetLeft))
          offset = knob.offsetLeft
        else
          this.linkKnobs(offset, knob, knobs, rangeWidth)
      }

      if (e.ctrlKey == false && e.metaKey == false && e.shiftKey == false)
        knobs.forEach(knob => (knob.children[0] as HTMLElement).style.display = 'none');

      knob.style.left = this.doMap(offset, 0, rangeWidth, 0, 100).toFixed(1) + '%';

      // update lightness scale
      knobs.forEach(knob => this.updateLightnessScaleEntry(knob.classList[1], this.doMap(knob.offsetLeft, 0, rangeWidth, 0, 100).toFixed(1)));
      this.updateKnobTooltip(tooltip, this.doMap(offset, 0, rangeWidth, 0, 100).toFixed(1))
    };

    document.addEventListener('mousemove', slide);

    document.onmouseup = () => {
      document.removeEventListener('mousemove', slide);
      knob.onmouseup = null;
      knob.style.zIndex = 1;
      knob.style.left = this.doMap(offset, 0, rangeWidth, 0, 100).toFixed(1) + '%';
      knobs.forEach(knob => (knob.children[0] as HTMLElement).style.display = 'none');
      console.log(lightness.scale)
    }

  }

  // Actions
  doLightnessScale = () => {
    let granularity: number = 1;

    this.props.knobsList.split(' ').forEach(index => {
      lightness.scale[`lightness-${index}`] = this.doMap(granularity, 0, 1, lightness.min, lightness.max).toFixed(1);
      granularity -= 1 / (this.props.knobsList.split(' ').length - 1)
    });

    return lightness.scale
  }

  updateLightnessScaleEntry = (key, value) => {
    lightness.scale[key] = value;
  }

  updateKnobTooltip = (tooltip, value) => {
    tooltip.style.display = 'block';
    tooltip.textContent = value
  }

  distributeKnobs = (type, value, knobs) => {
    if (type === 'MIN')
      lightness.min = parseFloat(value)
    else if (type === 'MAX')
      lightness.max = parseFloat(value);

    this.doLightnessScale();

    knobs.forEach(knob => {
      knob.style.left = lightness.scale[knob.classList[1]] + '%';
      this.updateKnobTooltip(knob.childNodes[0], lightness.scale[knob.classList[1]])
    })
  }

  linkKnobs = (offset, src, knobs, width) => {
    knobs.forEach(knob => {
      let shift = (knob.offsetLeft - src.offsetLeft) + offset;
      if (knob != src)
        knob.style.left = this.doMap(shift, 0, width, 0, 100) + '%';
      this.updateKnobTooltip(knob.childNodes[0], lightness.scale[knob.classList[1]])
    })
  }

  // Templates
  Input = (props) => {
    return (
      <div className='input'>
        <input type='number' min='0' max='100' step='0.1' className='input__field' value={props.value} />
      </div>
    )
  }

  Equal = (props) => {
    lightness.min = parseFloat(this.props.min);
    lightness.max = parseFloat(this.props.max);
    return (
      <div className='slider__range'>
        {Object.entries(this.doLightnessScale()).map(lightness =>
          <div key={lightness[0]} className={`slider__knob ${lightness[0]}`} style={{left: `${lightness[1]}%`}} onMouseDown={this.onSlide}>
            <div className='type type--inverse slider__tooltip'>{lightness[1]}</div>
            <div className='type slider__label'>{lightness[0].replace('lightness-', '')}</div>
            <div className='slider__input'>{this.state['id'] === lightness[0] ? <this.Input value={this.state['value']} /> : null}</div>
          </div>
        )}
      </div>
    )
  }

  Custom = (props) => {
    return (
      <div className='slider__range'>
        {Object.entries(JSON.parse(this.props.scale)).map(lightness =>
          <div key={lightness[0]} className={`slider__knob ${lightness[0]}`} style={{left: `${lightness[1]}%`}} onMouseDown={this.onSlide}>
            <div className='type type--inverse slider__tooltip'>{lightness[1]}</div>
            <div className='type slider__label'>{lightness[0].replace('lightness-', '')}</div>
            <div className='slider__input'>{this.state['id'] === lightness[0] ? <this.Input value={this.state['value']} /> : null}</div>
          </div>
        )}
      </div>
    )
  }

  render() {
    return (
      <div className='slider'>
        {this.props.type == 'EQUAL' ? <this.Equal /> : null}
        {this.props.type == 'CUSTOM' ? <this.Custom /> : null}
      </div>
    )
  }

}
