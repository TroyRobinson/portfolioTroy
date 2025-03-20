import * as React from 'react'
import { Scene, Storyboard } from 'utopia-api'
import { RouterProvider } from '../src/Router'
import { Link } from '../src/Router'
import { Route } from '../src/Router'
import { Routes } from '../src/Router'
import { App } from '../src/app'
import { Tag } from '../src/components/Tag'
import { Playground } from '../src/playground'
import { FlexCol } from '../src/utils'
import { FlexRow } from '../src/utils'
import { TwoColumnGrid } from '../src/utils'
import { ThreeColumnGrid } from '../src/utils'

export var storyboard = (
  <Storyboard>
    <Scene
      id='playground-scene'
      commentId='playground-scene'
      style={{
        width: 700,
        height: 700,
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
        top: 1760,
      }}
      data-label='Tag'
    >
      <Tag style={{}} />
    </Scene>
    <Scene
      id='routerprovider-scene'
      commentId='routerprovider-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 2624,
        top: 128,
      }}
      data-label='RouterProvider'
    >
      <RouterProvider />
    </Scene>
    <Scene
      id='link-scene'
      commentId='link-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 3440,
        top: 128,
      }}
      data-label='Link'
    >
      <Link />
    </Scene>
    <Scene
      id='route-scene'
      commentId='route-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 4256,
        top: 128,
      }}
      data-label='Route'
    >
      <Route />
    </Scene>
    <Scene
      id='routes-scene'
      commentId='routes-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 5072,
        top: 128,
      }}
      data-label='Routes'
    >
      <Routes />
    </Scene>
    <Scene
      id='flexcol-scene'
      commentId='flexcol-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 5888,
        top: 128,
      }}
      data-label='FlexCol'
    >
      <FlexCol style={{}} />
    </Scene>
    <Scene
      id='flexrow-scene'
      commentId='flexrow-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 6704,
        top: 128,
      }}
      data-label='FlexRow'
    >
      <FlexRow style={{}} />
    </Scene>
    <Scene
      id='twocolumngrid-scene'
      commentId='twocolumngrid-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 7520,
        top: 128,
      }}
      data-label='TwoColumnGrid'
    >
      <TwoColumnGrid />
    </Scene>
    <Scene
      id='threecolumngrid-scene'
      commentId='threecolumngrid-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 8336,
        top: 128,
      }}
      data-label='ThreeColumnGrid'
    >
      <ThreeColumnGrid />
    </Scene>
  </Storyboard>
)
