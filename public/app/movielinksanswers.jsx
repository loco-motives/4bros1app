import React from 'react';

class movieLinksAnswers extends React.Component {
  constructor(props){
    super(props)
    this.state = {movies:props.answers}
  }

  componentWillReceiveProps(nextProps){
    console.log('in will recieve props, next props are', nextProps)
    this.setState({
      movies: nextProps.answers
    })
  }

  render() {
    return (
    <div>
      {this.state.movies.map(
      answer => {
        return <div className='chatMessage'>
          <div>
            The next movie is {answer.movie}, with link {answer.link}
          </div>
        </div>
      })}
    </div>
    )
  }
}

export default movieLinksAnswers;