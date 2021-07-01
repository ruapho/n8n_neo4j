import { IExecuteFunctions } from 'n8n-core';
import { executeCypher, flatten } from './GenericFunctions'
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';


export class Neo4j implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Neo4j',
		name: 'neo4j',
		group: ['transform'],
		version: 1,
		description: 'Excecute cypher query against a neo4j graph database.',
		defaults: {
			name: 'Neo4j',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'neo4j',
				required: true
			}
		],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Cypher Query',
				name: 'cypher',
				type: 'string',
				default: 'MATCH (n) RETURN n.id as Id, n.name as Name, n.content as Content LIMIT 10',
				placeholder: 'Enter cypher code',
				description: 'The cypher query to excecute',
			}
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const cypher = this.getNodeParameter('cypher', 0);
		var result = flatten(await executeCypher.call(this, cypher));

		let returnItems = [];

		if (Array.isArray(result) && result.length !== 0) {
			returnItems = this.helpers.returnJsonArray(result);
		} else {
			returnItems = this.helpers.returnJsonArray([{}]);
		}

		return this.prepareOutputData(returnItems);
	}
}