import React from 'react';
import { Row, Col } from 'react-bootstrap';

function Home() {
  return (
    <>
        <div id='homebanner'></div>
        <Row className='justify-content-md-center'>
            <a className='adimage justify-content-md-center' id='planfuture' href='/register'></a>
            <a className='adimage' md='auto' id='getcheques' href='/register'></a>
            <a className='adimage justify-content-md-center' id='applycard' href='/register'></a>
        </Row>
    </>
  );
}

export default Home;
