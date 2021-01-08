import React from 'react';
import { Link, withRouter } from 'react-router-dom';

const Footer = withRouter(() => {
  return (
      <div
        className="footer"
        style={{
          backgroundColor: '#fed8b1',
          paddingTop: '2rem',
          marginTop: '2rem',
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-4 col-sm-5">
              <h5>Links</h5>
              <ul className="list-unstyled">
                <li>
                  <Link to='/'>Home</Link>
                </li>
                <li>
                  <a className='nav-link' href="http://structure.bmc.lu.se/" target="_blank">
                  Protein Bioinformatics Group, Faculty of Medicine, LU</a>
                </li>
                <li>
                  <a className='nav-link' href="https://www.ebi.ac.uk/pdbe/" target="_blank">PDB Europe</a>
                </li>
                <li>
                  <a className='nav-link' href="https://www.rcsb.org/" target="_blank">RCSB PDB</a>
                </li>
                <li>
                  <a className='nav-link' target="_blank"
                  href="https://www.ebi.ac.uk/thornton-srv/databases/cgi-bin/pdbsum/GetPage.pl?pdbcode=index.html">
                  PDBsum</a>
                </li>
              </ul>
            </div>
            <div className="col-7 col-sm-5">
              <h5>Our Address</h5>
              <address>
                BMC B13
                <br />
                Sölvegatan 19, 223 62 Lund
                <br />
                SWEDEN
                <br />
                <i className="fa fa-phone fa-lg"></i>: +46 1234 56789
                <br />
                <i className="fa fa-envelope fa-lg"></i>:{' '}
                <a href="mailto:structure@med.lu.se">structure@med.lu.se</a>
              </address>
            </div>
            <div className="col-12 col-sm-2 align-self-center">
              <div className="text-center">
                <a
                  className="btn btn-social-icon btn-linkedin"
                  href="http://www.linkedin.com/in/"
                >
                  <i className="fa fa-linkedin"></i>
                </a>
                <a
                  className="btn btn-social-icon btn-twitter"
                  href="http://twitter.com/"
                >
                  <i className="fa fa-twitter"></i>
                </a>
                <a className="btn btn-social-icon" href="mailto:ji8842zh-s@student.lu.se">
                  <i className="fa fa-envelope-o"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-auto">
              <p>© Copyright 2021 Lund University</p>
            </div>
          </div>
        </div>
      </div>
  );
});

export default Footer;
