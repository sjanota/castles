import React from 'react'

export function Field(props) {
  return (
    <span className="field"><span className="name">{props.name}</span>: <span className="value">{props.value}</span></span>
  )
}

export function Error(props) {
  return (
    <span className="error"><Field name="Error" value={props.value}/></span>
  )
}

export function ErrorP(props) {
  return (
    <p><Error value={props.value} /></p>
  )
}