import * as React from 'react'

interface Props {
  type: 'primary' | 'secondary' | 'tertiary' | 'icon'
  icon?: string
  label?: string
  state?: 'default' | 'disabled' | 'blocked' | 'selected' | ''
  isLink?: boolean
  url?: string
  feature?: string
  isBlocked?: boolean
  action?: React.MouseEventHandler & React.KeyboardEventHandler
}

export default class Button extends React.Component<Props> {
  static defaultProps = {
    isLink: false,
    isBlocked: false,
  }

  // Templates
  Button = () => {
    return (
      <button
        className={[
          'button',
          'button--' + this.props.type,
          this.props.isBlocked ? 'button--blocked' : null,
        ]
          .filter((n) => n)
          .join(' ')}
        data-feature={this.props.feature}
        disabled={this.props.state === 'disabled' ? true : false}
        tabIndex={this.props.state === 'disabled' ? -1 : 0}
        onKeyDown={(e) => {
          e.key === ' ' || e.key === 'Enter' ? this.props.action?.(e) : null
          e.key === 'Escape' ? (e.target as HTMLElement).blur() : null
        }}
        onMouseDown={this.props.action}
      >
        {this.props.label}
      </button>
    )
  }

  LinkButton = () => {
    return (
      <button
        className={['button', 'button--' + this.props.type]
          .filter((n) => n)
          .join(' ')}
        data-feature={this.props.feature}
      >
        <a
          href={this.props.url}
          target="_blank"
          rel="noreferrer"
        >
          {this.props.label}
        </a>
      </button>
    )
  }

  Icon = () => {
    return (
      <div
        data-feature={this.props.feature}
        className={[
          'icon-button',
          this.props.state != undefined && this.props.state != ''
            ? 'icon-button--' + this.props.state
            : null,
        ]
          .filter((n) => n)
          .join(' ')}
        tabIndex={this.props.state === 'disabled' ? -1 : 0}
        onKeyDown={(e) => {
          e.key === ' ' || e.key === 'Enter' ? this.props.action?.(e) : null
          e.key === 'Escape' ? (e.target as HTMLElement).blur() : null
        }}
        onMouseDown={this.props.action}
      >
        <div
          className={['icon', 'icon--' + this.props.icon]
            .filter((n) => n)
            .join(' ')}
        ></div>
      </div>
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.type != 'icon' ? (
          this.props.isLink ? (
            <this.LinkButton />
          ) : (
            <this.Button />
          )
        ) : (
          <this.Icon />
        )}
      </>
    )
  }
}
