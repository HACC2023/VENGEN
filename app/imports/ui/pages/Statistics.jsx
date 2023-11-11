import React, { useState, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import '../../../client/style.css';

/* Renders a table containing all of the Stuff documents. Use <StuffItem> to render each row. */
const Statistics = () => {
  const [state, setState] = useState({
    url: 'https://data.census.gov/profile?g=050XX00US15009',
    activeId: 'none',
  });

  const urls = [
    { id: 'maui', name: 'Maui County', url: 'https://data.census.gov/profile/Maui_County,_Hawaii?g=050XX00US15009' },
    { id: 'east-molokai', name: 'East Molokai CCD', url: 'https://data.census.gov/profile/East_Molokai_CCD,_Maui_County,_Hawaii?g=060XX00US1500990090' },
    { id: 'haiku-pauwela', name: 'Haiku Pauwela CCD', url: 'https://data.census.gov/profile/Haiku-Pauwela_CCD,_Maui_County,_Hawaii?g=060XX00US1500990360' },
    { id: 'hana', name: 'Hana CCD', url: 'https://data.census.gov/profile/Hana_CCD,_Maui_County,_Hawaii?g=060XX00US1500990450' },
    { id: 'kahului', name: 'Kahului CCD', url: 'https://data.census.gov/profile/Kahului_CCD,_Maui_County,_Hawaii?g=060XX00US1500990900' },
    { id: 'kihei', name: 'Kihei CCD', url: 'https://data.census.gov/profile/Kihei_CCD,_Maui_County,_Hawaii?g=060XX00US1500991530' },
    { id: 'kula', name: 'Kula CCD', url: 'https://data.census.gov/profile/Kula_CCD,_Maui_County,_Hawaii?g=060XX00US1500991890' },
    { id: 'lahaina', name: 'Lahaina CCD', url: 'https://data.census.gov/profile/Lahaina_CCD,_Maui_County,_Hawaii?g=060XX00US1500991980' },
    { id: 'lanai', name: 'Lanai CCD', url: 'https://data.census.gov/profile/Lanai_CCD,_Maui_County,_Hawaii?g=060XX00US1500992070' },
    { id: 'makawao-paia', name: 'Makawao-Paia CCD', url: 'https://data.census.gov/profile/Makawao-Paia_CCD,_Maui_County,_Hawaii?g=060XX00US1500992250' },
    { id: 'puunene', name: 'Puunene CCD', url: 'https://data.census.gov/profile/Puunene_CCD,_Maui_County,_Hawaii?g=060XX00US1500993060' },
    { id: 'spreckelsville', name: 'Spreckelsville CCD', url: 'https://data.census.gov/profile/Spreckelsville_CCD,_Maui_County,_Hawaii?g=060XX00US1500993330' },
    { id: 'waihee-waikapu', name: 'Waihee-Waikapu CCD', url: 'https://data.census.gov/profile/Waihee-Waikapu_CCD,_Maui_County,_Hawaii?g=060XX00US1500993690' },
    { id: 'wailuku', name: 'Wailuku CCD', url: 'https://data.census.gov/profile/Wailuku_CCD,_Maui_County,_Hawaii?g=060XX00US1500993870' },
    { id: 'west-molokai', name: 'West Molokai CCD', url: 'https://data.census.gov/profile/West_Molokai_CCD,_Maui_County,_Hawaii?g=060XX00US1500993960' },
  ];

  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  };

  const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
  };

  const { height, width } = useWindowDimensions();

  const handleClick = (url, id) => {
    setState({ url: url });
    state.activeId = id;
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const i in urls) {
      document.getElementById(urls[i].id).style.fontWeight = 'normal';
      document.getElementById(urls[i].id).style.textDecoration = 'none';
      if (state.activeId !== 'visitor-statistics') {
        document.getElementById('visitor-statistics').style.fontWeight = '500';
        document.getElementById('visitor-statistics').style.textDecoration = 'none';
      }
    }
    document.getElementById(id).style.fontWeight = 'bold';
    document.getElementById(id).style.textDecoration = 'underline';
  };

  return (
    <Row className="justify-content-start mx-5" style={{ padding: 0 }}>
      <Col md={2}>
        <h3 id="us-census">US Census Data</h3>
        <div style={{ marginLeft: 20 }}>
          <Row>
            <Col>
              {urls.map((i, idx) => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
                <h6 className="mouse-hover-click" onClick={() => handleClick(i.url, i.id)} id={i.id} key={idx} style={{ fontWeight: 'normal' }}>{i.name}</h6>
              ))}
            </Col>
          </Row>
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
        <h3 className="mouse-hover-click" onClick={() => handleClick('https://dbedt.hawaii.gov/visitor/tourism-dashboard/', 'visitor-statistics')} id="visitor-statistics">Visitor Statistics</h3>
      </Col>
      <Col md={10}>
        {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
        <iframe src={state.url} width={width / 1.3} height={height / 1.2} />
      </Col>
    </Row>
  );

};

export default Statistics;
