import * as React from 'react';
import Knob from './Knob';
import { palette } from '../../utils/palettePackage';
import { doMap } from './../../utils/doMap';

interface Props {
  knobs: Array<number>;
  service: string;
  presetName: string;
  type: string;
  min: string;
  max: string;
  scale: any;
  onChange: any
};

export default class Slider extends React.Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      selectedKnob: null,
      knobs: []
    }
  }

  // Events
  onGrab = (e: any) => {
    const knob = e.target as HTMLElement,
          range = knob.parentElement as HTMLElement,
          shift = e.nativeEvent.layerX as number,
          tooltip = knob.children[0] as HTMLElement,
          rangeWidth = range.offsetWidth as number,
          slider = range.parentElement as HTMLElement,
          knobs = Array.from(range.children as HTMLCollectionOf<HTMLElement>),
          startTime: number = Date.now();

    let offset: number,
        update = () => {
          palette.min = parseFloat(doMap((range.lastChild as HTMLElement).offsetLeft, 0, rangeWidth, 0, 100).toFixed(1));
          palette.max = parseFloat(doMap((range.firstChild as HTMLElement).offsetLeft, 0, rangeWidth, 0, 100).toFixed(1));
          knobs.forEach(knob => this.updateLightnessScaleEntry(knob.classList[1], doMap(knob.offsetLeft, 0, rangeWidth, 0, 100).toFixed(1)));
        };

    knob.style.zIndex = '2';
    knobs.forEach(knob => knob.classList.remove('slider__knob--selected'));
    this.setState({
      selectedKnob: null,
      knobs: knobs
    });

    document.onmousemove = (e) => this.onSlide(
      e,
      slider,
      range,
      knobs,
      knob,
      tooltip,
      offset,
      shift,
      rangeWidth,
      update
    );

    document.onmouseup = () => this.onRelease(
      knobs,
      knob,
      offset,
      update,
      rangeWidth,
      startTime
    )
  }

  onSlide = (e: any, slider: HTMLElement, range: HTMLElement, knobs: Array<HTMLElement>, knob: HTMLElement, tooltip: HTMLElement, offset: number, shift: number, rangeWidth: number, update: any) => {
    let limitMin: number, limitMax: number;
    const gap: number = doMap(2, 0, 100, 0, rangeWidth),
          sliderPadding: number = parseFloat(window.getComputedStyle(slider, null).getPropertyValue('padding-left'));
    offset = e.clientX - slider.offsetLeft - sliderPadding - shift;

    palette.min = parseFloat(doMap((range.lastChild as HTMLElement).offsetLeft, 0, rangeWidth, 0, 100).toFixed(1));
    palette.max = parseFloat(doMap((range.firstChild as HTMLElement).offsetLeft, 0, rangeWidth, 0, 100).toFixed(1));

    if (knob == range.lastChild) { // 900
      limitMin = 0;
      limitMax = (knob.previousElementSibling as HTMLElement).offsetLeft - gap
    } else if (knob == range.firstChild) { // 50
      limitMin = (knob.nextElementSibling as HTMLElement).offsetLeft + gap;
      limitMax = rangeWidth
    } else {
      limitMin = (knob.nextElementSibling as HTMLElement).offsetLeft + gap;
      limitMax = (knob.previousElementSibling as HTMLElement).offsetLeft - gap
    }

    if (offset <= limitMin)
      offset = limitMin
    else if (offset >= limitMax)
      offset = limitMax;

    // distribute knobs horizontal spacing
    if (knob == range.lastChild && e.shiftKey) // 900
      this.distributeKnobs('MIN', doMap(offset, 0, rangeWidth, 0, 100).toFixed(1), knobs)
    else if (knob == range.firstChild && e.shiftKey) // 50
      this.distributeKnobs('MAX', doMap(offset, 0, rangeWidth, 0, 100).toFixed(1), knobs)

    // link every knob
    if (e.ctrlKey || e.metaKey) {
      if (offset < (knob.offsetLeft - (range.lastChild as HTMLElement).offsetLeft) || offset > (rangeWidth - (range.firstChild as HTMLElement).offsetLeft + knob.offsetLeft))
        offset = knob.offsetLeft
      else
        this.linkKnobs(offset, knob, knobs, rangeWidth)
    }

    if (e.ctrlKey == false && e.metaKey == false && e.shiftKey == false)
      knobs.forEach(knob => (knob.children[0] as HTMLElement).style.display = 'none');

    knob.style.left = doMap(offset, 0, rangeWidth, 0, 100).toFixed(1) + '%';

    // update lightness scale
    knobs.forEach(knob => this.updateLightnessScaleEntry(knob.classList[1], doMap(knob.offsetLeft, 0, rangeWidth, 0, 100).toFixed(1)));
    this.updateKnobTooltip(tooltip, doMap(offset, 0, rangeWidth, 0, 100).toFixed(1));
    update();
    this.props.onChange()
  }

  onRelease = (knobs: Array<HTMLElement>, knob: HTMLElement, offset: number, update: any, rangeWidth: number, startTime: number) => {
    document.onmousemove = null;
    document.onmouseup = null;
    knob.onmouseup = null;
    knob.style.zIndex = '1';
    knobs.forEach(knob => (knob.children[0] as HTMLElement).style.display = 'none');
    update();
    if (Date.now() - startTime < 200 && this.props.presetName === 'Custom' && this.props.service === 'EDIT') {
      this.setState({
        selectedKnob: knob
      });
      knob.classList.add('slider__knob--selected')
    }
    this.props.onChange('released')
  }

  onAdd = (e: any) => {
    const rangeWidth: number = e.currentTarget.offsetWidth,
          sliderPadding: number = parseFloat(window.getComputedStyle(e.currentTarget.parentNode, null).getPropertyValue('padding-left')),
          offset: number = doMap(e.clientX - sliderPadding, 0, rangeWidth, 0, 100);

    let newScale = [],
        newLightnessScale = {};

    newScale = Object.values(this.props.scale);
    newScale.length < 25 ? newScale.push(offset.toFixed(1)) : null;
    newScale.sort((a, b) => b - a);
    newScale.forEach((scale, index) => newLightnessScale[`lightness-${index + 1}`] = scale)

    if (e.target.classList[0] === 'slider__range' && newScale.length < 25 && this.props.presetName === 'Custom') {
      palette.scale = newLightnessScale;
      palette.preset = {
        name: 'Custom',
        scale: Object.keys(palette.scale).map(key => parseFloat(key.replace('lightness-', ''))),
        min: 0,
        max: 100
      };
      this.props.onChange('customized')
    }
  }

  onDelete = () => {
    let newScale = [],
        newLightnessScale = {};

    Object.values(this.props.scale).forEach(scale => {
      scale === parseFloat(this.state['selectedKnob'].style.left).toFixed(1) ? null : newScale.push(scale)
    });
    newScale.forEach((scale, index) => newLightnessScale[`lightness-${index + 1}`] = scale);
    this.state['selectedKnob'].classList.remove('slider__knob--selected')
    this.setState({
      selectedKnob: null
    });
    this.state['knobs'].forEach(knob => knob.classList.remove('slider__knob--selected'));

    palette.scale = newLightnessScale;
    palette.preset = {
      name: 'Custom',
      scale: Object.keys(palette.scale).map(key => parseFloat(key.replace('lightness-', ''))),
      min: 0,
      max: 100
    };
    this.props.onChange('customized')
  }

  // Actions
  doLightnessScale = () => {
    let granularity: number = 1;

    this.props.knobs.map(index => {
      palette.scale[`lightness-${index}`] = doMap(granularity, 0, 1, palette.min, palette.max).toFixed(1).replace('-', '');
      granularity -= 1 / (this.props.knobs.length - 1)
    });

    return palette.scale
  }

  updateLightnessScaleEntry = (key: string, value: string) => {
    palette.scale[key] = value
  }

  updateKnobTooltip = (tooltip: HTMLElement, value: string) => {
    tooltip.style.display = 'block';
    tooltip.textContent = value === '100.0' ? '100' : value
  }

  distributeKnobs = (type: string, value: string, knobs: Array<HTMLElement>) => {
    if (type === 'MIN')
      palette.min = parseFloat(value)
    else if (type === 'MAX')
      palette.max = parseFloat(value);

    this.doLightnessScale();

    knobs.forEach(knob => {
      knob.style.left = palette.scale[knob.classList[1]] + '%';
      this.updateKnobTooltip(knob.childNodes[0] as HTMLElement, palette.scale[knob.classList[1]])
    })
  }

  linkKnobs = (offset: number, src: HTMLElement, knobs: Array<HTMLElement>, width: number) => {
    knobs.forEach(knob => {
      let shift = (knob.offsetLeft - src.offsetLeft) + offset;
      if (knob != src)
        knob.style.left = doMap(shift, 0, width, 0, 100) + '%';
      this.updateKnobTooltip(knob.childNodes[0] as HTMLElement, palette.scale[knob.classList[1]])
    })
  }

  componentDidMount() {
    window.onkeydown = (e: any) => {
      if (e.key === 'Backspace' && this.state['selectedKnob'] != null && this.props.knobs.length > 2)
        this.onDelete()
    }
  }

  // Templates
  Equal = () => {
    palette.min = parseFloat(this.props.min);
    palette.max = parseFloat(this.props.max);
    return (
      <div className='slider__range'>
        {Object.entries(this.doLightnessScale()).map(lightness =>
          <Knob
            key={lightness[0]}
            id={lightness[0]}
            scale={lightness[1]}
            number={lightness[0].replace('lightness-', '')}
            action={this.onGrab}
          />
        )}
      </div>
    )
  }

  Custom = () => {
    return (
      <div
        className='slider__range'
        onClick={this.onAdd}
      >
        {Object.entries(this.props.scale).map(lightness =>
          <Knob
            key={lightness[0]}
            id={lightness[0]}
            scale={lightness[1]}
            number={lightness[0].replace('lightness-', '')}
            action={this.onGrab}
          />
        )}
      </div>
    )
  }

  render() {
    return (
      <div className='slider'>
        {this.props.type === 'EQUAL' ? <this.Equal /> : null}
        {this.props.type === 'CUSTOM' ? <this.Custom /> : null}
      </div>
    )
  }

}
