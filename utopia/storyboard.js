import * as React from 'react'
import { Scene, Storyboard } from 'utopia-api'
import { App } from '../src/app'
import { PageLayout } from '../src/components/PageLayout'
import { Tag } from '../src/components/Tag'
import { Playground } from '../src/playground'

export var storyboard = (
  <Storyboard>
    <Scene
      id='playground-scene'
      commentId='playground-scene'
      style={{
        width: 700,
        height: 759,
        position: 'absolute',
        left: 212,
        top: 128,
      }}
      data-label='Playground'
    >
      <Playground style={{}} />
    </Scene>
    <Scene
      id='app-scene'
      commentId='app-scene'
      style={{
        width: 744,
        height: 1133,
        position: 'absolute',
        left: 992,
        top: 128,
      }}
      data-label='My App'
    >
      <App />
    </Scene>
    <Scene
      id='tag-scene'
      commentId='tag-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 1808,
        top: 128,
      }}
      data-label='Tag'
    >
      <Tag style={{}} />
    </Scene>
    <Scene
      id='pagelayout-scene'
      commentId='pagelayout-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 2624,
        top: 128,
      }}
      data-label='PageLayout'
    >
      <PageLayout style={{}} />
    </Scene>
  </Storyboard>
)
