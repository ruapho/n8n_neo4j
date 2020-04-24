import { OptionsWithUri } from 'request';
import {
	IExecuteFunctions,
	IPollFunctions
} from 'n8n-core';

export async function executeCypher(this: IPollFunctions | IExecuteFunctions, cypher: string) {
    const credentials = this.getCredentials('neo4j');
		if (credentials === undefined) {
			throw new Error('No credentials got returned!');
		}
		const httpBasicAuth = Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");

		const body = {
			"statements": [
				{
					"statement": cypher
				}
			]
		};

		const options: OptionsWithUri = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Basic ${httpBasicAuth}`
			},
			method: "POST",
			body: body,
			uri: `${credentials.url}/db/neo4j/tx/commit`,
			json: true
        };
        
        return await this.helpers.request!(options);
}

export function flatten(neo4jResult: any): Array<{[k: string]: string}> {
    let result = neo4jResult.results.map(r => {
        let mapped = r.data.map( (data) => {
          var mappedData = data.row.map((value, index) => {
            let key = r.columns[index];
            let obj: {[k: string]: string} = {};
            obj[key] = value
            return obj;
           });
          
          let mapped2 = mappedData.reduce( (a, b) => {
            return { ...a, ...b };
          }, {});
      
          return mapped2;
        });
        return mapped;
      });
      
      return result[0];
}

export function comparer(otherArray) {
    return function(current) {
        return otherArray.filter(function(other) {
            return JSON.stringify(current) == JSON.stringify(other);
        }).length == 0;
    }
}