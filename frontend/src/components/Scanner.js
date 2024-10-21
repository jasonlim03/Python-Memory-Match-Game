import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function Scanner({ onScan }) { // Accept a prop for the scan result callback
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 500,
        height: 500,
      },
      fps: 5,
    });

    scanner.render(success, error);

    function success(result) {
      scanner.clear();
      setScanResult(result);
      onScan(result); // Call the callback with the scanned result
    }

    function error(err) {
      console.warn(err);
    }
  }, [onScan]);

  return (
    <div style={{
      backgroundColor: '#7843e6',
      color:'white'
    }}>
      { scanResult
        ? <div>Success: <a href={scanResult}>(scanResult)</a></div>
        : <div id="reader"></div>
      }
    </div>
  );
}

export default Scanner;
