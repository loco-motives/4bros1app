import React from 'react';
import axios from 'axios'
import { Col, Grid, Row } from 'react-bootstrap'


class movieEntry extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
		}
	}

	render() {
		var movie = this.props.movie
	  return (
      <Col sm={6} md={2}> 
      	<img className="movieEntry"
		  onClick = {() => {this.props.openDetails(movie)}} 
		  src={movie.thumbnail}/>
      	<p>{movie.title}</p>
      </Col>
	  );
	}
}

export default movieEntry

