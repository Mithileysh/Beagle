import React, {
	Component,
	PropTypes
} from 'react';
import {	bindActionCreators} from 'redux';
import {	connect} from 'react-redux';
import WordCloud from '../components/WordCloud';
import dataSource from '../sources/dataSource';
import {addListItem} from '../actions/const';

require('styles//wordcloud-component-words.scss');
class WordCloudContainer extends Component {
	constructor() {
		super();
		this.state = {
			words: [],
			field: ''
		}
	}

	componentWillMount() {
		this.loadData(this.props.state);
	}

	componentWillReceiveProps(nextProps) {
		this.loadData(nextProps.state);
	}

	translateStateToFilter(state) {
    var jsonQuery = {
      filters: []
    }
    state.filters.forEach(function(element) {
			if (typeof element.values !== 'undefined'){
	      var jsonData ={};
	      var selection;

	      //var selection = this.translateSelection(element.selection);
				if (element.selection == 'SUBJECT CONTAINS:') {
					selection = 'Subject';
				} else if (element.selection == 'CONTENT CONTAINS:') {
					selection = 'Contents';
				} else if (element.selection == 'PERSON:') {
					selection = 'PERSON';
				} else if (element.selection == 'ORGANIZATION:') {
					selection = 'ORGANIZATION';
				} else {
					selection = 'ToAddresses';
				}

	      jsonData['field'] = selection;
	      jsonData['operation'] = 'contains';
	      jsonData['value'] = element.values;
	      jsonQuery.filters.push(jsonData);
			}
    });
    return jsonQuery;
  }

	loadData(newState) {							//loadData sends the query to the suQl server and retrieves the data
		let {field} = this.props;
		this.state.field = field;
		let query = `query getData($filters:[Rule]){
			Select(filters:$filters) {
				Summaries{
					${field} {
						Key
						Count
					}
				}
			}
		}`

		dataSource.query(
			query, this.translateStateToFilter(newState)
		).then(
			r => {
				if (typeof r.data !== 'undefined'){
					this.setState({words: r.data.Select.Summaries[field]})
				}
			}).catch((err) => console.log('In ContactListContainer: ', err.message));

	}


	render() {
		const {actions} = this.props;

		return <WordCloud {...actions} words = {this.state.words} field = {this.state.field}/>;
	}
}

WordCloudContainer.propTypes = {
	actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
	const props = {state};
	return props;
}

function mapDispatchToProps(dispatch) {
	const actions = {addListItem};
	const actionMap = {
		actions: bindActionCreators(actions, dispatch)
	};
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(WordCloudContainer);
