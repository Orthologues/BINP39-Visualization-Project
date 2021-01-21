import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem, Card, CardHeader, CardTitle, CardText } from 'reactstrap';
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
          <Navbar expand="md" className="navbar navbar-dark" style={{ backgroundColor: '#2f3f4f' }}>
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
          <Card>
            <CardHeader>
              <CardTitle tag='h5'>PON-SC+ for Amino Acid clash detection, Molecular visualization, UI access to RCSB-PDB's API, Mapping to UniprotID etc</CardTitle>
              <CardText style={{ textAlign: 'left' }}>This tool identifies if an amino acid substitution would cause clashes in protein structure or not. Taking PDB format file or PDB accession codes as input, for each position of interest substitutions are modeled using backbone-dependent rotamer library (<a target="_blank" href="https://pubmed.ncbi.nlm.nih.gov/21645855/">Shapovalov and Dunbrack, 2011</a>). Sterical clashes are calculated based on the distance between atoms.</CardText>
            </CardHeader>
          </Card>
        </div>
      )  
    }
}

export default Header;