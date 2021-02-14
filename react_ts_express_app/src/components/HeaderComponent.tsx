import React, { FC, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem } from 'reactstrap';
import { FRONTEND_PREFIX } from '../shared/Consts';

const Header: FC<any> = () => {
  const [isNavOpen, setNavOpen] = useState<boolean>(false);
  const toggleNav = () => {
    setNavOpen(prev => !prev);
  }
  return (
    <div className='sticky-wrapper'>
      <div className='sticky'>
        <Navbar expand="md" className="navbar navbar-dark" style={{backgroundColor: '#301934'}}>
          <NavbarToggler 
          onClick={toggleNav}  style={{ marginRight: "1rem" }}/>
          <NavbarBrand className="mr-auto" href="/" >
            <img 
            src={`${FRONTEND_PREFIX}/logo192.png`} 
            height="36" 
            width="36" 
            alt='PON-SC+' 
            style={{ marginRight: "1rem" }}/>
          </NavbarBrand>
          <Collapse isOpen={isNavOpen} navbar>
            <Nav navbar>
            <NavItem>
              <NavLink className="nav-link"  to='/home'>
                <span className="fa fa-home fa-lg App-header-nav-icon"></span>Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className="nav-link" to='/about'>
                <span className="fa fa-info fa-lg App-header-nav-icon"></span>About</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className="nav-link"  to='/mol-visualization'>
                <span className="fa fa-list fa-lg App-header-nav-icon"></span>Molecular Visualization</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className="nav-link"  to='/rcsb-info'>
                <span className="fa fa-list fa-lg App-header-nav-icon"></span>Info by PDB-ID and Uniprot-ID</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className="nav-link" to='/disclaimer'>
                <span className="fa fa-address-card fa-lg App-header-nav-icon"></span>Disclaimer</NavLink>
            </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    </div>
  )  
}

export default Header;