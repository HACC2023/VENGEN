import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { Accounts } from 'meteor/accounts-base';
import { Button, Form, Modal } from 'react-bootstrap';

const TwoFactorAuth = () => {
  const [qrCode, setQrCode] = useState(null);
  const [qrKey, setQrKey] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  Accounts.has2faEnabled((err, result) => {
    setIs2faEnabled(result);
  });

  const generate2FA = () => {
    Accounts.generate2faActivationQrCode('LahainaSim', (err, result) => {
      if (err) {
        return;
      }
      const { svg, secret } = result;
      setQrCode(Buffer.from(svg).toString('base64'));
      setQrKey(secret);
      setShowQR(true);
    });
  };

  const submit2FA = (e) => {
    e.preventDefault();
    const code = document.getElementById('2fa').value;
    Accounts.enableUser2fa(code);
    setShowQR(false);
  };

  const disable2FA = () => {
    Accounts.disableUser2fa();
    setIs2faEnabled(false);
  };

  return (
    <>
      {is2faEnabled ?
        <Button onClick={disable2FA} variant="danger" style={{ display: 'block', width: '100%' }} alt="Disable Two-Factor">Disable Two-Factor</Button> :
        <Button className="theme-button" onClick={generate2FA} style={{ display: 'block', width: '100%' }} alt="Enable Two-Factor">Enable Two-Factor</Button>}

      <Modal show={showQR} onHide={() => setShowQR(false)} centered>
        <Modal.Header closeButton />
        <Modal.Body style={{ textAlign: 'center' }}>
          <h4>Scan the QR Code below with your authenticator app of choice.</h4>
          <img width="200" src={`data:image/svg+xml;base64,${qrCode}`} alt="2FA QR Code" />
          <h6>Or manually enter the key below:</h6>
          <p><b>Key: </b>{qrKey}</p>
          <Form>
            Enter 2FA code from your authenticator app.
            <Form.Control id="2fa" />
            <Button variant="primary" type="submit" onClick={(event) => submit2FA(event)} style={{ marginTop: '1em' }} alt="Submit 2FA Code">Submit</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TwoFactorAuth;
