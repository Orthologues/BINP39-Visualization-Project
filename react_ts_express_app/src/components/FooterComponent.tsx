import React, { FC } from 'react';

const Footer: FC<any> = () => {
  return (
      <div className="footer" style={{ backgroundColor: '#fed8b1', paddingTop: '1.5rem' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-5">
              <h5>Links</h5>
              <ul className="list-unstyled">
                <li>
                  <a className='nav-link' href="http://structure.bmc.lu.se/" target="_blank">
                  Protein Bioinformatics Group, Faculty of Medicine, LU</a>
                </li>
                <li>
                  <a className='nav-link' href="http://structure.bmc.lu.se/idbase/BTKbase/index.php?content=base_table_1/IDbases" target="_blank">
                  Aminoacid substitutions - BTKbase</a>
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
            <div className="col-12 col-md-5">
              <h5>Our Address</h5>
              <address>
                BMC B13
                <br />
                Sölvegatan 19, 223 62 Lund
                <br />
                SWEDEN
                <br />
                <i className="fa fa-phone fa-lg"></i>: +46 46 222 72 14
                <br />
                <i className="fa fa-envelope fa-lg"></i>:{' '}
                <a href="mailto:mauno.vihinen@med.lu.se">mail to Prof. Mauno Vihinen</a>
                <br />
                <i className="fa fa-envelope fa-lg"></i>:{' '}
                <a href="mailto:jwz.student.bmc.lu@gmail.com">mail to Jiawei Zhao</a>
            </address>
            </div>
            <div className="col-12 col-md-2 align-self-center">
              <div className="text-center">
                <a target="_blank" className="btn btn-social-icon btn-linkedin"
                href="https://www.linkedin.com/in/jiawei-zhao-5268681b0/">
                  <i className="fa fa-linkedin"></i>
                </a>
                <a target="_blank" className="btn btn-social-icon btn-twitter"
                href="https://twitter.com/medfak_lu?lang=en">
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
};

export default Footer;
