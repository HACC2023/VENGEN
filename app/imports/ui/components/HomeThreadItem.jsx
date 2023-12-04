import React from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { HandThumbsDownFill, HandThumbsUpFill, Chat } from 'react-bootstrap-icons';

/** Renders a single row in the List Stuff table. See pages/ListStuff.jsx. */
const HomeThreadItem = ({ thread }) => (
  <>
    <a href={`/thread/${thread._id}`} style={{ textDecoration: 'none' }}>
      <Row className="mb-2 align-items-left" style={{ textAlign: 'left' }}>
        <Image src="/images/pfp.jpg" roundedCircle style={{ width: '4em' }} />
        <p style={{ marginTop: '-2.5em', paddingLeft: '4em' }}>{thread.owner} | {thread.messages[0].time.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
        <p className="mt-2 mb-0" style={{ fontSize: '20px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}><strong>{thread.title}</strong></p>
        <p className="mb-1" style={{ wordWrap: 'break-word', lineHeight: 'normal' }}>{thread.messages[0].message.length > 500 ? `${thread.messages[0].message.substring(0, 500)}...` : thread.messages[0].message}</p>
        <Row>
          <Col>
            <Chat />{`      ${thread.messages.length - 1} Comments`}
          </Col>
          <Col xs={5}>
            <div style={{ float: 'right' }}>
              <HandThumbsUpFill color="green" />
              <span style={{ marginRight: 5 }}>{thread.likes}</span>
              <HandThumbsDownFill color="red" />
              <span>{thread.dislikes}</span>
            </div>
          </Col>
        </Row>
      </Row>
    </a>
    <hr />
  </>
);

// Require a document to be passed to this component.
HomeThreadItem.propTypes = {
  thread: PropTypes.shape({
    owner: PropTypes.string,
    title: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    messages: PropTypes.array,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    _id: PropTypes.string,
  }).isRequired,
};

export default HomeThreadItem;
