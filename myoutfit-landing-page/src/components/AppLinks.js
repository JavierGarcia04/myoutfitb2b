import React, { Component } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactGA from 'react-ga4';

class AppLinks extends Component {
  trackClickGA = (event_name) => {
    // Add event tracking here, but ensure it only runs when the button is clicked
    ReactGA.event({
      category: 'Button Click',
      action: event_name,
    });
  };

  render() {
    const { forNav } = this.props;
    const appleLink = '#';
    const googleLink = '#';
    return (
      <div className="my-3 mx-auto text-center">
        <Link
          href={appleLink}
          onClick={() => this.trackClickGA('AppStoreLinkClick')}
        >
          <img
            src="/images/download_apple.svg"
            alt="Download MyOutfit on the App Store"
            className="m-2"
            style={{ maxWidth: '150px' }}
          />
        </Link>
        <Link
          href={googleLink}
          onClick={() => this.trackClickGA('GooglePlayLinkClick')}
        >
          <img
            src="/images/download_google.svg"
            alt="Download MyOutfit on the App Store"
            className="m-2"
            style={{ maxWidth: '166px' }}
          />
        </Link>
      </div>
    );
  }
}

export default AppLinks;
