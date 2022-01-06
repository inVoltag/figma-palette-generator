import * as React from 'react';
import Slider from './Slider';
import Switch from './Switch';
import Button from './Button';
import Message from './Message';
import { palette } from '../data';

interface Props {
  isPaletteSelected: boolean;
  scale: string;
  hasCaptions: boolean
};

export default class UpdatePalette extends React.Component<Props> {

  // Events
  slideHandler = () => {
    parent.postMessage({ pluginMessage: { type: 'update-palette', palette } }, '*');
  }

  checkHandler = (e: any) => {
    this.setState({ hasCaptions: e.target.checked });
    palette.captions = e.target.checked
    parent.postMessage({ pluginMessage: { type: 'update-captions', palette } }, '*')
  }

  onCreate = () => {
    parent.postMessage({ pluginMessage: { type: 'create-local-styles', palette } }, '*')
  }

  onUpdate = () => {
    parent.postMessage({ pluginMessage: { type: 'update-local-styles', palette } }, '*')
  }

  // Templates
  Message = () => {
    return (
      <div className='message'>
        <Message
          icon='warning'
          messages= 'Select an Awesome palette to update it'
        />
      </div>
    )
  }

  Scale = () => {
    return (
      <>
      <div className='lightness-scale'>
        <div className='section-title'>Lightness scale</div>
        <Slider
          type='CUSTOM'
          knobsList='50 100 200 300 400 500 600 700 800 900'
          min=''
          max=''
          scale={this.props.scale}
          onChange={this.slideHandler}
        />
        <Message
          icon='library'
          messages= 'Hold Shift ⇧ while dragging 50 or 900 to distribute knobs\' horizontal spacing ; Hold Ctrl ⌃ or Cmd ⌘ while dragging a knob to move them all'
        />
      </div>
      <div className='actions'>
        <div className='buttons'>
          <Button type='secondary' label='Update local styles' action={this.onUpdate} />
          <Button type='primary' label='Create local styles' action={this.onCreate} />
        </div>
        <Switch id='showCaptions' label='Show captions' isChecked={this.props.hasCaptions} onChange={this.checkHandler} />
      </div>
      </>
    )
  }

  render() {
    palette.captions = this.props.hasCaptions
    return (
      <section>
        {!this.props.isPaletteSelected ? <this.Message /> : null}
        {this.props.isPaletteSelected ? <this.Scale /> : null}
      </section>
    )
  }

}
