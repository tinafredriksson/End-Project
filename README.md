# End-Project

Landningssidan innehåller index.html, app.js & style.css
HTML är uppbyggd enligt DOM i strukturen med koppling till style.css i
headern samt kopplingen till JS längst ner i Body. Viktigt för att kopplingen
ska fungera är att använda JS/JS/app.js för att html ska hitta JS mappen på rätt ställe.
Landningssidan är uppdelad med en Huvudrubrik samt ett hyllplan
med två böcker till vänster som rör sig vid hoover. En döskalle i mitten
som lyser upp och visar en knapp du kan ta dig vidare till sida 2 via.
Längts till höger ser vi ett brinnande ljus. Ljuset och böckerna är stylat
via CSS med en hover funktion. Döskallen i mitten styrs av app.js med en
funktion som styrs via en addeventlistener.


Sida 2
Uppbyggd med books.html och app.js
stylingen är gjord direkt i HTML. Denna kan man bygga in i
samma css fil som till sida 1 men jag har valt att behålla den i HTML
då stylingen inte är så stor. För en bättre struktur kan man bygga det
i den befintliga CSS filen eller skapa en ny som heter books.css men
det skulle jag rekomendera om man ska utveckla hemsidan och bygga bredare
styling.
kopplingen till JS ligger längst ner i body.
Det svåraste med detta API var att den kraschade när jag försökte ladda
in för mycket data. Jag valde att specificera förstasidan man möts av
till ett specifikt sökord för att begränsa in-datan. Sökordet kan ändras
till tex hospital eller lämnas tomt. Om fältet lämnas tomt kommer
den köra default och istället hämta information från sökordet "the"
som är uppbyggt i buildQuery.
