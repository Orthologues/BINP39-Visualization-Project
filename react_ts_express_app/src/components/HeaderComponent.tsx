import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem, Jumbotron } from 'reactstrap';
import { FRONTEND_PREFIX } from '../shared/Consts';

type HeaderState= { isNavOpen: boolean };

class Header extends Component<any, HeaderState> {

    constructor(props: any) {
        super(props);
        this.toggleNav = this.toggleNav.bind(this);
        this.state = {
            isNavOpen: false
        };
      }

    toggleNav() {
      this.setState({
        isNavOpen: !this.state.isNavOpen
      });
    }

    render() {
      return (
        <div>
          <Navbar expand="md" className="navbar navbar-light bg-light">
            <NavbarToggler 
            onClick={this.toggleNav}  style={{ marginRight: "1rem" }}/>
            <NavbarBrand className="mr-auto" href="/" >
              <img 
              src={`${FRONTEND_PREFIX}/logo192.png`} 
              height="36" 
              width="36" 
              alt='PON-SC+' 
              style={{ marginRight: "1rem" }}/>
            </NavbarBrand>
            <Collapse isOpen={this.state.isNavOpen} navbar>
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
      )  
    }
}

export default Header;