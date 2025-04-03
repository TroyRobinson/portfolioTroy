import * as React from 'react'
import { Scene, Storyboard } from 'utopia-api'
import App from '../src/app'
import Navigation from '../src/components/Navigation'
import { PageLayout } from '../src/components/PageLayout'
import { Tag } from '../src/components/Tag'
import { Button } from '../src/components/UI/Button'
import AboutPage from '../src/pages/AboutPage'
import CaseStudyDetail from '../src/pages/CaseStudyDetail'
import ContactPage from '../src/pages/ContactPage'
import PortfolioPage from '../src/pages/PortfolioPage'
import { Playground } from '../src/playground'

export var storyboard = (
  <Storyboard>
    <Scene
      id='navigation-scene'
      commentId='navigation-scene'
      style={{
        width: 800,
        height: 80,
        position: 'absolute',
        left: 212,
        top: 1200,
      }}
      data-label='Navigation'
    >
      <Navigation style={{}} />
    </Scene>
    <Scene
      id='pagelayout-scene'
      commentId='pagelayout-scene'
      style={{
        width: 600,
        height: 400,
        position: 'absolute',
        left: 212,
        top: 1340,
      }}
      data-label='PageLayout'
    >
      <PageLayout style={{}} />
    </Scene>
    <Scene
      id='tag-scene'
      commentId='tag-scene'
      style={{
        width: 110,
        height: 44,
        position: 'absolute',
        left: 212,
        top: 1800,
      }}
      data-label='Tag'
    >
      <Tag style={{}} />
    </Scene>
    <Scene
      id='button-scene'
      commentId='button-scene'
      style={{
        width: 120,
        height: 40,
        position: 'absolute',
        left: 600,
        top: 1200,
      }}
      data-label='Button (UI)'
    >
      <Button style={{}} />
    </Scene>
    <Scene
      id='aboutpage-scene'
      commentId='aboutpage-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 1808,
        top: 128,
      }}
      data-label='AboutPage'
    >
      <AboutPage style={{}} />
    </Scene>
    <Scene
      id='casestudydetail-scene'
      commentId='casestudydetail-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 2624,
        top: 128,
      }}
      data-label='CaseStudyDetail'
    >
      <CaseStudyDetail style={{}} />
    </Scene>
    <Scene
      id='contactpage-scene'
      commentId='contactpage-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 3440,
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
        height: 700,
        position: 'absolute',
        left: 4256,
        top: 128,
      }}
      data-label='PortfolioPage'
    >
      <PortfolioPage style={{}} />
    </Scene>
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
  </Storyboard>
)
