from flask import Flask
from SPARQLWrapper import SPARQLWrapper, JSON
from flask import request
from flask.ext.cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    auth = request.authorization
    sparql = SPARQLWrapper('https://knowledgestore2.fbk.eu/nwr/dutchhouse/sparql')
    sparql.setQuery("""
        SELECT * WHERE {dbpedia:Barack_Obama rdfs:label ?label . } LIMIT 100
        """)
    sparql.setCredentials(auth.username, auth.password)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    r = ['{} {}'.format(k, v) for k, v in results.iteritems()]
    return ' '.join(r)

if __name__ == '__main__':
    app.run(debug=True)
