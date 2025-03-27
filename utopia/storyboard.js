import * as React from 'react'
import { Scene, Storyboard } from 'utopia-api'
import App from '../src/app'
import Navigation from '../src/components/Navigation'
import { PageLayout } from '../src/components/PageLayout'
import { Tag } from '../src/components/Tag'
import AboutPage from '../src/pages/AboutPage'
import ContactPage from '../src/pages/ContactPage'
import PortfolioPage from '../src/pages/PortfolioPage'
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
        width: 110,
        height: 44,
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
        height: 524,
        position: 'absolute',
        left: 1808,
        top: 656,
      }}
      data-label='PageLayout'
    >
      <PageLayout style={{}} />
    </Scene>
    <Scene
      id='navigation-scene'
      commentId='navigation-scene'
      style={{
        width: 781,
        height: 103,
        position: 'absolute',
        left: 1808,
        top: 374,
      }}
      data-label='Navigation'
    >
      <Navigation style={{}} />
    </Scene>
    <Scene
      id='aboutpage-scene'
      commentId='aboutpage-scene'
      style={{
        width: 700,
        height: 1188,
        position: 'absolute',
        left: 2696,
        top: 128,
      }}
      data-label='AboutPage'
    >
      <AboutPage style={{}} />
    </Scene>
    <Scene
      id='contactpage-scene'
      commentId='contactpage-scene'
      style={{
        width: 700,
        height: 1168,
        position: 'absolute',
        left: 3552,
        top: 128,
      }}
      data-label='ContactPage'
    >
      <ContactPage style={{}} />
    </Scene>
    <Scene
      id='portfoliopage-scene'
      commentId='portfoliopage-scene'
      style={{
        width: 700,
        height: 1956,
        position: 'absolute',
        left: 4400,
        top: 128,
      }}
      data-label='PortfolioPage'
    >
      <PortfolioPage style={{}} />
    </Scene>
  </Storyboard>
)
