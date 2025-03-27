import React from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import { FlexCol, FlexRow } from '../utils.jsx';
import { Tag } from '../components/Tag.jsx';
import Navigation from '../components/Navigation.jsx';
import PageLayout from '../components/PageLayout.jsx';

const AboutPage = () => {
  return (
    <PageLayout title="About Me">
      <FlexCol style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <p style={{ lineHeight: '1.6', fontSize: '1.1rem', padding: '0 0 20px 0' }}>
          I'm a passionate web developer and designer with expertise in creating modern, responsive, and user-friendly websites and applications. With over 5 years of experience, I specialize in React, Node.js, and modern frontend development practices.
        </p>
        
        <h3 style={{ fontSize: '1.4rem', padding: '0 0 15px 0' }}>Skills</h3>
        <FlexRow style={{ flexWrap: 'wrap', padding: '0 0 20px 0' }}>
          <Tag>React</Tag>
          <Tag>Node.js</Tag>
          <Tag>TypeScript</Tag>
          <Tag>GraphQL</Tag>
          <Tag>Next.js</Tag>
          <Tag>CSS/SCSS</Tag>
          <Tag>Figma</Tag>
          <Tag>UI/UX Design</Tag>
        </FlexRow>
      </FlexCol>
    </PageLayout>
  );
};

export default AboutPage; 