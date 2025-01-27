const fs = require( 'fs' );
const path = require( 'path' );
const client = require( 'https' );
const axios = require( 'axios' );

const iconsPath = path.join( __dirname, 'icons' );

const sourceRepos = [
  [ 'token', 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/' ],
  [ 'name', 'https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/128/' ],
];

// download token new image
const fetchJson = function( address, callback ) {
  const request = {
    method: 'GET',
    url: address,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Node.js Applicatioin',
    }
  };
  axios( request ).then( callback ).catch( console.log );
};

// download token new image
const downloadImage = function( url, filepath ) {
  if ( url && !fs.existsSync( filepath ) ) {
    client.get( url, res => {
      console.log( '-'.repeat( 100 ) );
      console.log( 'Input:', url );
      console.log( 'Output:', filepath );

      if ( res.statusCode === 200 ) {
        res.pipe( fs.createWriteStream( filepath ) )
          .on( 'error', err => console.log( 'Error:', err.message || 'Failed to write file.' ) )
          .once( 'close', () => console.log( 'Success:', 'Saved file.' ) );
      } else {
        console.log( 'Failed:', 'HTTP Status', res.statusCode );
        res.resume();
      }
    });
  }
};

// fetch symbols and names from coinbase API
const fetchFromCoinbase = function() {
  fetchJson( 'https://api.exchange.coinbase.com/currencies', res => {
    const list = res.data || [];

    for ( let repo of sourceRepos ) {
      const [ nameType, baseUrl ] = repo;

      for ( let asset of list ) {
        const { id, name } = asset;
        const lookupTokenFile = String( id ).toLowerCase() + '.png';
        const lookupNameFile = String( name ).toLowerCase().replace( /[^\w]+/g, '-' ) + '.png';
        const outpuFilePath = path.join( iconsPath, lookupTokenFile );

        if ( nameType === 'token' ) {
          downloadImage( baseUrl + lookupTokenFile, outpuFilePath );
        }
        if ( nameType === 'name' ) {
          downloadImage( baseUrl + lookupNameFile, outpuFilePath );
        }
      }
    }
  });
};

// fetch symbols and names from coincap API
const fetchFromCoincap = function() {
  fetchJson( 'https://api.coincap.io/v2/assets?limit=2000', res => {
    const list = res.data?.data || [];

    for ( let repo of sourceRepos ) {
      const [ nameType, baseUrl ] = repo;

      for ( let asset of list ) {
        const { id, symbol } = asset;
        const lookupTokenFile = String( symbol ).toLowerCase() + '.png';
        const lookupNameFile = String( id ).toLowerCase().replace( /[^\w]+/g, '-' ) + '.png';
        const outpuFilePath = path.join( iconsPath, lookupTokenFile );

        if ( nameType === 'token' ) {
          downloadImage( baseUrl + lookupTokenFile, outpuFilePath );
        }
        if ( nameType === 'name' ) {
          downloadImage( baseUrl + lookupNameFile, outpuFilePath );
        }
      }
    }
  });
};

fetchFromCoinbase();
fetchFromCoincap();
