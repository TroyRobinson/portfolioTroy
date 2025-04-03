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
      <>
        {/* Simplified App preview for storyboard */}
        <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
          <div style={{ border: '1px dashed #ccc', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>App Component</h3>
            <p style={{ margin: '0 0 10px 0' }}>This component contains a Router with the following routes:</p>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>/ → AboutPage</li>
              <li>/portfolio → PortfolioPage</li>
              <li>/portfolio/:slug → CaseStudyDetail</li>
              <li>/contact → ContactPage</li>
            </ul>
          </div>
          {/* Preview of default route content */}
          <div style={{ border: '1px solid #eee', borderRadius: '4px', padding: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Preview of default route</h4>
            <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '10px 15px', background: '#e9e9e9', borderRadius: '4px', fontSize: '14px' }}>
                  Router content will be displayed here
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}>AboutPage</div>
                  <div style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}>PortfolioPage</div>
                  <div style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}>CaseStudyDetail</div>
                  <div style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}>ContactPage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
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
      <Playground style={{}}>
        Playground Content
      </Playground>
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
      <CaseStudyDetail slug="sample-case-study" />
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
      id='navigation-scene'
      commentId='navigation-scene'
      style={{
        width: 800,
        height: 80,
        position: 'absolute',
        left: 212,
        top: 1584,
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
        top: 1884,
      }}
      data-label='PageLayout'
    >
      <PageLayout style={{}} title="Sample Title">
        <div>Sample content</div>
      </PageLayout>
    </Scene>
    <Scene
      id='tag-scene'
      commentId='tag-scene'
      style={{
        width: 110,
        height: 44,
        position: 'absolute',
        left: 212,
        top: 2504,
      }}
      data-label='Tag'
    >
      <Tag>Tag label</Tag>
    </Scene>
    <Scene
      id='button-scene'
      commentId='button-scene'
      style={{
        width: 120,
        height: 40,
        position: 'absolute',
        left: 1148,
        top: 1584,
      }}
      data-label='Button (UI)'
    >
      <Button style={{}} onClick={() => {}}>
        Click Me
      </Button>
    </Scene>
  </Storyboard>
)
