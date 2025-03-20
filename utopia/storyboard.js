import * as React from 'react'
import { Scene, Storyboard } from 'utopia-api'
import { App } from '../src/app'
import Header from '../src/components/Header'
import Navigation from '../src/components/Navigation'
import { Tag } from '../src/components/Tag'
import AboutPage from '../src/pages/AboutPage'
import ContactPage from '../src/pages/ContactPage'
import PortfolioPage from '../src/pages/PortfolioPage'

export var storyboard = (
  <Storyboard>
    <Scene
      id='header-scene'
      commentId='header-scene'
      style={{
        width: 700,
        height: 200,
        position: 'absolute',
        left: 212,
        top: 128,
      }}
      data-label='Header'
    >
      <Header />
    </Scene>
    <Scene
      id='navigation-scene'
      commentId='navigation-scene'
      style={{
        width: 700,
        height: 100,
        position: 'absolute',
        left: 992,
        top: 128,
      }}
      data-label='Navigation'
    >
      <Navigation />
    </Scene>
    <Scene
      id='app-scene'
      commentId='app-scene'
      style={{
        width: 744,
        height: 1133,
        position: 'absolute',
        left: 1808,
        top: 128,
      }}
      data-label='My App'
    >
      <App />
    </Scene>
    <Scene
      id='aboutpage-scene'
      commentId='aboutpage-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 212,
        top: 944,
      }}
      data-label='About Page'
    >
      <AboutPage />
    </Scene>
    <Scene
      id='contactpage-scene'
      commentId='contactpage-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 992,
        top: 944,
      }}
      data-label='Contact Page'
    >
      <ContactPage />
    </Scene>
    <Scene
      id='portfoliopage-scene'
      commentId='portfoliopage-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 1808,
        top: 944,
      }}
      data-label='Portfolio Page'
    >
      <PortfolioPage />
    </Scene>
    <Scene
      id='tag-scene'
      commentId='tag-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 212,
        top: 1760,
      }}
      data-label='Tag'
    >
      <Tag>Example Tag</Tag>
    </Scene>
  </Storyboard>
)
