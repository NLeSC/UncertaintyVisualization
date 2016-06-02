java -Xmx2000m -cp ../lib/EventCoreference-1.0-SNAPSHOT-jar-with-dependencies.jar eu.newsreader.eventcoreference.naf.ClusterEventObjects --microstories 4 --naf-folder "../tmp" --event-folder "../tmp" --extension ".naf" --project timeline --communication-frames "../resources/communication.txt" --grammatical-frames "../resources/grammatical.txt" --contextual-frames "../resources/contextual.txt" --bridging --frame-relations ../resources/frRelation.xml --frame-level 3

java -Xmx2000m -cp ../lib/EventCoreference-1.0-SNAPSHOT-jar-with-dependencies.jar eu.newsreader.eventcoreference.naf.MatchEventObjects --match-type ILILEMMA --event-folder "../tmp/events/contextual" --single-output --event-type "contextual" --ili-uri

java -Xmx2000m -cp ../lib/EventCoreference-1.0-SNAPSHOT-jar-with-dependencies.jar eu.newsreader.eventcoreference.input.TrigToJsonTimeLine --trig-folder "../tmp/events/contextual" --ili "../resources/wn3-ili-synonyms.txt"
