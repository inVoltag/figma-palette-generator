import * as React from 'react';
import Dispatcher from '../modules/Dispatcher';
import Slider from '../components/Slider';
import Switch from '../components/Switch';
import Button from '../components/Button';
import Message from '../components/Message';
import ColorItem from '../components/ColorItem';
import Tabs from '../components/Tabs';
import chroma from 'chroma-js';
import { palette } from '../../palette-package';

interface Props {
  scale: any;
  hasCaptions: boolean;
  colors: any;
  context: string;
  preset: any;
  onCaptionsChange: any;
  onColorChange: any;
  onContextChange: any
};

export default class EditPalette extends React.Component<Props> {

  dispatch: any;

  constructor(props) {
    super(props);
    this.dispatch = {
      scale: new Dispatcher(
        () => parent.postMessage({ pluginMessage: { type: 'update-scale', palette } }, '*'),
        500
      )
    };
    this.state = {
      draggableElement: ''
    }
  }

  // Events
  slideHandler = (e: string) => e === 'released' ? this.dispatch.scale.on.status = false : this.dispatch.scale.on.status = true

  checkHandler = (e: any) => {
    this.props.onCaptionsChange(e.target.checked);
    palette.captions = e.target.checked;
    parent.postMessage({ pluginMessage: { type: 'update-captions', palette } }, '*')
    this.setState({
      draggableElement: ''
    })
  }

  colorHandler = (e: any) => {
    this.props.onColorChange(e)
    this.setState({
      draggableElement: ''
    })
  }

  navHandler = (e: any) => {
    this.props.onContextChange(e)
    this.setState({
      draggableElement: ''
    })
  }

  orderHandler = (e: any) => {
    const target: HTMLElement = e.currentTarget,
          neighbours: Array<Element> = Array.from(target.parentElement.children)
    if (target !== e.target) return;
    this.setState({
      draggableElement: target.id
    })
  }

  unSelectColor = (e: any) => {
    e.target.closest('li.colors__item') == null ? this.setState({
      draggableElement: ''
    }) : null
  }

  onCreate = () => {
    parent.postMessage({ pluginMessage: { type: 'create-local-styles', palette } }, '*')
    this.setState({
      draggableElement: ''
    })
  }

  onUpdate = () => {
    parent.postMessage({ pluginMessage: { type: 'update-local-styles', palette } }, '*')
    this.setState({
      draggableElement: ''
    })
  }

  // Templates
  Scale = () => {
    palette.scale = {};
    return (
      <div className='lightness-scale'>
      <div className='section-controls'>
        <div className='section-title'>Lightness scale</div>
        <div className='label'>{this.props.preset.name}</div>
      </div>
        <Slider
          type='CUSTOM'
          knobs={this.props.preset.scale}
          min=''
          max=''
          scale={this.props.scale}
          onChange={this.slideHandler}
        />
        <Message
          icon='library'
          messages= {[
            'Hold Shift ⇧ while dragging 50 or 900 to distribute knobs\' horizontal spacing',
            'Hold Ctrl ⌃ or Cmd ⌘ while dragging a knob to move them all'
          ]}
        />
      </div>
    )
  }

  Colors = () => {
    return (
      <div className='starting-colors'>
        <div className='section-controls'>
          <div className='section-title'>Starting colors</div>
          <Button
            id='add'
            icon='plus'
            type='icon'
            label={null}
            state=''
            action={this.colorHandler}
          />
        </div>
        <ul className='colors'>
          {this.props.colors.map(color =>
            <ColorItem
              key={color.id}
              name={color.name}
              hex={chroma(color.rgb.r * 255, color.rgb.g * 255, color.rgb.b * 255).hex()}
              uuid={color.id}
              dragged={this.state['draggableElement'] === color.name ? true : false}
              onColorChange={this.colorHandler}
              onReorder={this.orderHandler}
            />
          )}
        </ul>
      </div>
    )
  }

  Actions = () => {
    return (
      <div className='actions'>
        <div className='buttons'>
          <Button
            id={null}
            icon={null}
            type='secondary'
            label='Update the local styles'
            state=''
            action={this.onUpdate}
          />
          <Button
            id={null}
            icon={null}
            type='primary'
            label='Create local styles'
            state=''
            action={this.onCreate}
          />
        </div>
        <Switch
          id='showCaptions'
          label='Show captions'
          isChecked={this.props.hasCaptions}
          onChange={this.checkHandler}
        />
      </div>
    )
  }

  Controls = () => {
    return (
      <>
      <div className='controls'>
        {this.props.context === 'Scale' ? <this.Scale /> : null}
        {this.props.context === 'Colors' ? <this.Colors /> : null}
      </div>
      <this.Actions />
      </>
    )
  }

  render() {
    palette.captions = this.props.hasCaptions;
    return (
      <>
        <Tabs
          tabs={['Scale', 'Colors']}
          active={this.props.context}
          onClick={this.navHandler}
        />
        <section onClick={this.unSelectColor}>
          <this.Controls />
        </section>
      </>
    )
  }

}
