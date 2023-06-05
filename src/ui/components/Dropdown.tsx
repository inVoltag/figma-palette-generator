import * as React from 'react'
import { selectMenu } from 'figma-plugin-ds'

interface Props {
  id: string
  options: Array<{
    label: string,
    feature: string
  }>
  selected: string
  onChange: React.ChangeEventHandler
}

export default class Dropdown extends React.Component<Props> {
  componentDidMount = () => {
    selectMenu.init()
    document.getElementById(this.props.id).onchange = (e: any) =>
      this.props.onChange(e)
  }

  render() {
    return (
      <select
        id={this.props.id}
        className="select-menu"
        defaultValue={this.props.selected}
      >
        {this.props.options.map((option, index) => (
          <option
            key={index}
            value={option.label}
            data-action={option.feature}
          >
            {option.label}
          </option>
        ))}
      </select>
    )
  }
}
