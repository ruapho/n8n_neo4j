import { IPollFunctions } from 'n8n-core';
import { executeCypher, flatten, comparer } from './GenericFunctions'
import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData
} from 'n8n-workflow';


export class Neo4jTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Neo4j Trigger',
		name: 'neo4jTrigger',
		group: ['trigger'],
		version: 1,
		description: 'Triggers when the result of neo4j query changes.',
		defaults: {
			name: 'Neo4j Trigger',
			color: '#00FF00',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'neo4j',
				required: true
			}
		],
		polling: true,
		properties: [
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

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		try {
			const webhookData = this.getWorkflowStaticData('node');
			const cypher = this.getNodeParameter('cypher');
			let result = await executeCypher.call(this, cypher);
			let flattend = flatten(result);
			
			let diffList;
			if(webhookData.lastItems == null) {
				webhookData.lastItems = JSON.stringify(flattend);
				diffList = flattend;
			}
			else {
				let lastItems: Array<{[k: string]: string}> = JSON.parse(webhookData.lastItems as string);
				var onlyInFlattend = flattend.filter(comparer(lastItems));
				var onlyInLastItems = lastItems.filter(comparer(flattend));
				diffList = onlyInFlattend.concat(onlyInLastItems);
			}

			let returnItems = [this.helpers.returnJsonArray(diffList as IDataObject[])];
			return returnItems;
		}
		catch (e) {
			console.error(e);
		}
	}


}
