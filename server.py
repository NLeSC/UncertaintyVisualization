from flask import Flask
from SPARQLWrapper import SPARQLWrapper, JSON
from flask import request, jsonify
from flask.ext.cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    auth = request.authorization
    query = request.args.get('query')

    if not auth is None and not query is None:
        sparql = SPARQLWrapper('https://knowledgestore2.fbk.eu/nwr/dutchhouse/sparql')
        sparql.setQuery(query)
        sparql.setCredentials(auth.username, auth.password)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return jsonify(**results)
    else:
        msg = []
        if auth is None:
            msg.append('authorization error')
        if query is None:
            msg.append('no query')

        response = jsonify({'status': 404, 'statusText': ' '.join(msg)})
        response.status_code = 404
        return response

if __name__ == '__main__':
    app.run(debug=True)
