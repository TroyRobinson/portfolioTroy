import React from 'react'

export const FlexCol = ({ children, style, ...props }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export const FlexRow = ({ children, style, ...props }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function TwoColumnGrid({
  children,
  style,
  ...props
}) {
  return (
    <div
      {...props}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function ThreeColumnGrid({
  children,
  style,
  ...props
}) {
  return (
    <div
      {...props}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        width: '100%',
        hieght: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
