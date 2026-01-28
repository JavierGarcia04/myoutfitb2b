import React, { Component } from 'react';
import Link from 'next/link';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoTiktok,
  IoLogoTwitter,
  IoLogoYoutube,
} from 'react-icons/io5';

class Footer extends Component {
  render() {
    const current_year = new Date().getFullYear();
    return (
      <div id="section_footer">
        <div className="text-center py-4">
          <Link href="policies/privacy-policies.html" className="btn btn-link">
            Políticas de Privacidad
          </Link>
          <span>|</span>
          <Link href="policies/terms-conditions.html" className="btn btn-link">
            Términos y Condiciones
          </Link>
          <span>|</span>
          <Link
            href="https://mail.google.com/mail/?view=cm&fs=1&to=contacto@myoutfitapp.com"
            target="_blank"
            className="btn btn-link"
          >
            Contacto
          </Link>

          <div className="mt-2 mb-3">
            <Link href="#" className="social-icon mx-1">
              <IoLogoFacebook size={25} />
            </Link>

            <Link href="#" className="social-icon mx-1">
              <IoLogoInstagram size={25} />
            </Link>

            <Link href="#" className="social-icon mx-1">
              <IoLogoLinkedin size={25} />
            </Link>

            <Link href="#" className="social-icon mx-1">
              <IoLogoTiktok size={25} />
            </Link>

            <Link href="#" className="social-icon mx-1">
              <IoLogoYoutube size={25} />
            </Link>
          </div>

          <p>
            Copyright © {current_year}, MyOutfit app LLC. All Rights Reserved.
          </p>
        </div>
      </div>
    );
  }
}

export default Footer;
