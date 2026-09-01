'use strict';

const SPANISH_SETS = [
  {
    "id": 1,
    "title": "Greetings & Introductions",
    "cards": [
      {
        "en": "hello",
        "es": "hola"
      },
      {
        "en": "good morning",
        "es": "buenos días"
      },
      {
        "en": "good afternoon",
        "es": "buenas tardes"
      },
      {
        "en": "good night",
        "es": "buenas noches"
      },
      {
        "en": "goodbye",
        "es": "adiós"
      },
      {
        "en": "see you later",
        "es": "hasta luego"
      },
      {
        "en": "see you tomorrow",
        "es": "hasta mañana"
      },
      {
        "en": "how are you?",
        "es": "¿Cómo estás?"
      },
      {
        "en": "I'm fine, thank you",
        "es": "estoy bien, gracias"
      },
      {
        "en": "thank you",
        "es": "gracias"
      },
      {
        "en": "thank you very much",
        "es": "muchas gracias"
      },
      {
        "en": "you're welcome",
        "es": "de nada"
      },
      {
        "en": "please",
        "es": "por favor"
      },
      {
        "en": "excuse me",
        "es": "disculpe"
      },
      {
        "en": "I'm sorry",
        "es": "lo siento"
      },
      {
        "en": "what is your name?",
        "es": "¿Cómo te llamas?"
      },
      {
        "en": "my name is Ana",
        "es": "me llamo Ana"
      },
      {
        "en": "nice to meet you",
        "es": "mucho gusto"
      },
      {
        "en": "yes",
        "es": "sí"
      },
      {
        "en": "no",
        "es": "no"
      },
      {
        "en": "good",
        "es": "bueno"
      },
      {
        "en": "the pleasure is mine",
        "es": "el gusto es mío"
      },
      {
        "en": "where are you from?",
        "es": "¿De dónde eres?"
      },
      {
        "en": "I am from the United States",
        "es": "soy de Estados Unidos"
      },
      {
        "en": "how old are you?",
        "es": "¿Cuántos años tienes?"
      },
      {
        "en": "I am twenty years old",
        "es": "tengo veinte años"
      },
      {
        "en": "welcome",
        "es": "bienvenido"
      },
      {
        "en": "take care",
        "es": "cuídate"
      },
      {
        "en": "have a nice day",
        "es": "que tengas un buen día"
      },
      {
        "en": "talk to you soon",
        "es": "hablamos pronto"
      }
    ]
  },
  {
    "id": 2,
    "title": "Numbers 0-100",
    "cards": [
      {
        "en": "zero",
        "es": "cero"
      },
      {
        "en": "one",
        "es": "uno"
      },
      {
        "en": "two",
        "es": "dos"
      },
      {
        "en": "three",
        "es": "tres"
      },
      {
        "en": "four",
        "es": "cuatro"
      },
      {
        "en": "five",
        "es": "cinco"
      },
      {
        "en": "six",
        "es": "seis"
      },
      {
        "en": "seven",
        "es": "siete"
      },
      {
        "en": "eight",
        "es": "ocho"
      },
      {
        "en": "nine",
        "es": "nueve"
      },
      {
        "en": "ten",
        "es": "diez"
      },
      {
        "en": "eleven",
        "es": "once"
      },
      {
        "en": "twelve",
        "es": "doce"
      },
      {
        "en": "thirteen",
        "es": "trece"
      },
      {
        "en": "fourteen",
        "es": "catorce"
      },
      {
        "en": "fifteen",
        "es": "quince"
      },
      {
        "en": "sixteen",
        "es": "dieciséis"
      },
      {
        "en": "seventeen",
        "es": "diecisiete"
      },
      {
        "en": "eighteen",
        "es": "dieciocho"
      },
      {
        "en": "nineteen",
        "es": "diecinueve"
      },
      {
        "en": "twenty",
        "es": "veinte"
      },
      {
        "en": "twenty-one",
        "es": "veintiuno"
      },
      {
        "en": "thirty",
        "es": "treinta"
      },
      {
        "en": "forty",
        "es": "cuarenta"
      },
      {
        "en": "fifty",
        "es": "cincuenta"
      },
      {
        "en": "sixty",
        "es": "sesenta"
      },
      {
        "en": "seventy",
        "es": "setenta"
      },
      {
        "en": "eighty",
        "es": "ochenta"
      },
      {
        "en": "ninety",
        "es": "noventa"
      },
      {
        "en": "one hundred",
        "es": "cien"
      }
    ]
  },
  {
    "id": 3,
    "title": "Colors & Basic Adjectives",
    "cards": [
      {
        "en": "red",
        "es": "rojo"
      },
      {
        "en": "orange (color)",
        "es": "naranja"
      },
      {
        "en": "yellow",
        "es": "amarillo"
      },
      {
        "en": "green",
        "es": "verde"
      },
      {
        "en": "blue",
        "es": "azul"
      },
      {
        "en": "purple",
        "es": "morado"
      },
      {
        "en": "pink",
        "es": "rosado"
      },
      {
        "en": "brown",
        "es": "marrón"
      },
      {
        "en": "black",
        "es": "negro"
      },
      {
        "en": "white",
        "es": "blanco"
      },
      {
        "en": "gray",
        "es": "gris"
      },
      {
        "en": "big",
        "es": "grande"
      },
      {
        "en": "small",
        "es": "pequeño"
      },
      {
        "en": "tall",
        "es": "alto"
      },
      {
        "en": "short",
        "es": "bajo"
      },
      {
        "en": "good",
        "es": "bueno"
      },
      {
        "en": "bad",
        "es": "malo"
      },
      {
        "en": "new",
        "es": "nuevo"
      },
      {
        "en": "old",
        "es": "viejo"
      },
      {
        "en": "happy",
        "es": "feliz"
      },
      {
        "en": "sad",
        "es": "triste"
      },
      {
        "en": "hot",
        "es": "caliente"
      },
      {
        "en": "cold",
        "es": "frío"
      },
      {
        "en": "easy",
        "es": "fácil"
      },
      {
        "en": "difficult",
        "es": "difícil"
      },
      {
        "en": "fast",
        "es": "rápido"
      },
      {
        "en": "slow",
        "es": "lento"
      },
      {
        "en": "beautiful",
        "es": "hermoso"
      },
      {
        "en": "ugly",
        "es": "feo"
      },
      {
        "en": "strong",
        "es": "fuerte"
      }
    ]
  },
  {
    "id": 4,
    "title": "Family Members",
    "cards": [
      {
        "en": "mother",
        "es": "madre"
      },
      {
        "en": "father",
        "es": "padre"
      },
      {
        "en": "parents",
        "es": "padres"
      },
      {
        "en": "son",
        "es": "hijo"
      },
      {
        "en": "daughter",
        "es": "hija"
      },
      {
        "en": "children",
        "es": "hijos"
      },
      {
        "en": "brother",
        "es": "hermano"
      },
      {
        "en": "sister",
        "es": "hermana"
      },
      {
        "en": "siblings",
        "es": "hermanos"
      },
      {
        "en": "grandmother",
        "es": "abuela"
      },
      {
        "en": "grandfather",
        "es": "abuelo"
      },
      {
        "en": "grandparents",
        "es": "abuelos"
      },
      {
        "en": "aunt",
        "es": "tía"
      },
      {
        "en": "uncle",
        "es": "tío"
      },
      {
        "en": "cousin (male)",
        "es": "primo"
      },
      {
        "en": "cousin (female)",
        "es": "prima"
      },
      {
        "en": "nephew",
        "es": "sobrino"
      },
      {
        "en": "niece",
        "es": "sobrina"
      },
      {
        "en": "husband",
        "es": "esposo"
      },
      {
        "en": "wife",
        "es": "esposa"
      },
      {
        "en": "family",
        "es": "familia"
      },
      {
        "en": "baby",
        "es": "bebé"
      },
      {
        "en": "grandson",
        "es": "nieto"
      },
      {
        "en": "granddaughter",
        "es": "nieta"
      },
      {
        "en": "stepmother",
        "es": "madrastra"
      },
      {
        "en": "stepfather",
        "es": "padrastro"
      },
      {
        "en": "mother-in-law",
        "es": "suegra"
      },
      {
        "en": "father-in-law",
        "es": "suegro"
      },
      {
        "en": "twin",
        "es": "gemelo"
      },
      {
        "en": "godmother",
        "es": "madrina"
      }
    ]
  },
  {
    "id": 5,
    "title": "Days, Months, Telling Time",
    "cards": [
      {
        "en": "Monday",
        "es": "lunes"
      },
      {
        "en": "Tuesday",
        "es": "martes"
      },
      {
        "en": "Wednesday",
        "es": "miércoles"
      },
      {
        "en": "Thursday",
        "es": "jueves"
      },
      {
        "en": "Friday",
        "es": "viernes"
      },
      {
        "en": "Saturday",
        "es": "sábado"
      },
      {
        "en": "Sunday",
        "es": "domingo"
      },
      {
        "en": "January",
        "es": "enero"
      },
      {
        "en": "February",
        "es": "febrero"
      },
      {
        "en": "March",
        "es": "marzo"
      },
      {
        "en": "April",
        "es": "abril"
      },
      {
        "en": "May",
        "es": "mayo"
      },
      {
        "en": "June",
        "es": "junio"
      },
      {
        "en": "July",
        "es": "julio"
      },
      {
        "en": "August",
        "es": "agosto"
      },
      {
        "en": "September",
        "es": "septiembre"
      },
      {
        "en": "October",
        "es": "octubre"
      },
      {
        "en": "November",
        "es": "noviembre"
      },
      {
        "en": "December",
        "es": "diciembre"
      },
      {
        "en": "today",
        "es": "hoy"
      },
      {
        "en": "tomorrow",
        "es": "mañana"
      },
      {
        "en": "yesterday",
        "es": "ayer"
      },
      {
        "en": "week",
        "es": "semana"
      },
      {
        "en": "month",
        "es": "mes"
      },
      {
        "en": "year",
        "es": "año"
      },
      {
        "en": "hour",
        "es": "hora"
      },
      {
        "en": "minute",
        "es": "minuto"
      },
      {
        "en": "what time is it?",
        "es": "¿Qué hora es?"
      },
      {
        "en": "it's three o'clock",
        "es": "son las tres"
      },
      {
        "en": "it's noon",
        "es": "es mediodía"
      }
    ]
  },
  {
    "id": 6,
    "title": "Common -ar Verbs (Present Tense)",
    "cards": [
      {
        "en": "I speak",
        "es": "hablo"
      },
      {
        "en": "you speak (informal)",
        "es": "hablas"
      },
      {
        "en": "he/she speaks",
        "es": "habla"
      },
      {
        "en": "we speak",
        "es": "hablamos"
      },
      {
        "en": "they speak",
        "es": "hablan"
      },
      {
        "en": "I walk",
        "es": "camino"
      },
      {
        "en": "you walk (informal)",
        "es": "caminas"
      },
      {
        "en": "he/she walks",
        "es": "camina"
      },
      {
        "en": "we walk",
        "es": "caminamos"
      },
      {
        "en": "they walk",
        "es": "caminan"
      },
      {
        "en": "I work",
        "es": "trabajo"
      },
      {
        "en": "you work (informal)",
        "es": "trabajas"
      },
      {
        "en": "he/she works",
        "es": "trabaja"
      },
      {
        "en": "we work",
        "es": "trabajamos"
      },
      {
        "en": "they work",
        "es": "trabajan"
      },
      {
        "en": "I study",
        "es": "estudio"
      },
      {
        "en": "you study (informal)",
        "es": "estudias"
      },
      {
        "en": "he/she studies",
        "es": "estudia"
      },
      {
        "en": "we study",
        "es": "estudiamos"
      },
      {
        "en": "they study",
        "es": "estudian"
      },
      {
        "en": "I buy",
        "es": "compro"
      },
      {
        "en": "you buy (informal)",
        "es": "compras"
      },
      {
        "en": "he/she buys",
        "es": "compra"
      },
      {
        "en": "we buy",
        "es": "compramos"
      },
      {
        "en": "they buy",
        "es": "compran"
      },
      {
        "en": "I listen",
        "es": "escucho"
      },
      {
        "en": "you listen (informal)",
        "es": "escuchas"
      },
      {
        "en": "he/she listens",
        "es": "escucha"
      },
      {
        "en": "we listen",
        "es": "escuchamos"
      },
      {
        "en": "they listen",
        "es": "escuchan"
      }
    ]
  },
  {
    "id": 7,
    "title": "Common -er/-ir Verbs (Present Tense)",
    "cards": [
      {
        "en": "I eat",
        "es": "como"
      },
      {
        "en": "you eat (informal)",
        "es": "comes"
      },
      {
        "en": "he/she eats",
        "es": "come"
      },
      {
        "en": "we eat",
        "es": "comemos"
      },
      {
        "en": "they eat",
        "es": "comen"
      },
      {
        "en": "I drink",
        "es": "bebo"
      },
      {
        "en": "you drink (informal)",
        "es": "bebes"
      },
      {
        "en": "he/she drinks",
        "es": "bebe"
      },
      {
        "en": "we drink",
        "es": "bebemos"
      },
      {
        "en": "they drink",
        "es": "beben"
      },
      {
        "en": "I run",
        "es": "corro"
      },
      {
        "en": "you run (informal)",
        "es": "corres"
      },
      {
        "en": "he/she runs",
        "es": "corre"
      },
      {
        "en": "we run",
        "es": "corremos"
      },
      {
        "en": "they run",
        "es": "corren"
      },
      {
        "en": "I live",
        "es": "vivo"
      },
      {
        "en": "you live (informal)",
        "es": "vives"
      },
      {
        "en": "he/she lives",
        "es": "vive"
      },
      {
        "en": "we live",
        "es": "vivimos"
      },
      {
        "en": "they live",
        "es": "viven"
      },
      {
        "en": "I write",
        "es": "escribo"
      },
      {
        "en": "you write (informal)",
        "es": "escribes"
      },
      {
        "en": "he/she writes",
        "es": "escribe"
      },
      {
        "en": "we write",
        "es": "escribimos"
      },
      {
        "en": "they write",
        "es": "escriben"
      },
      {
        "en": "I open",
        "es": "abro"
      },
      {
        "en": "you open (informal)",
        "es": "abres"
      },
      {
        "en": "he/she opens",
        "es": "abre"
      },
      {
        "en": "we open",
        "es": "abrimos"
      },
      {
        "en": "they open",
        "es": "abren"
      }
    ]
  },
  {
    "id": 8,
    "title": "Food & Drink",
    "cards": [
      {
        "en": "water",
        "es": "agua"
      },
      {
        "en": "bread",
        "es": "pan"
      },
      {
        "en": "rice",
        "es": "arroz"
      },
      {
        "en": "chicken",
        "es": "pollo"
      },
      {
        "en": "meat",
        "es": "carne"
      },
      {
        "en": "fish",
        "es": "pescado"
      },
      {
        "en": "egg",
        "es": "huevo"
      },
      {
        "en": "cheese",
        "es": "queso"
      },
      {
        "en": "milk",
        "es": "leche"
      },
      {
        "en": "coffee",
        "es": "café"
      },
      {
        "en": "tea",
        "es": "té"
      },
      {
        "en": "juice",
        "es": "jugo"
      },
      {
        "en": "wine",
        "es": "vino"
      },
      {
        "en": "beer",
        "es": "cerveza"
      },
      {
        "en": "fruit",
        "es": "fruta"
      },
      {
        "en": "apple",
        "es": "manzana"
      },
      {
        "en": "banana",
        "es": "plátano"
      },
      {
        "en": "orange (fruit)",
        "es": "naranja"
      },
      {
        "en": "vegetable",
        "es": "verdura"
      },
      {
        "en": "potato",
        "es": "papa"
      },
      {
        "en": "tomato",
        "es": "tomate"
      },
      {
        "en": "salad",
        "es": "ensalada"
      },
      {
        "en": "soup",
        "es": "sopa"
      },
      {
        "en": "sugar",
        "es": "azúcar"
      },
      {
        "en": "salt",
        "es": "sal"
      },
      {
        "en": "pepper",
        "es": "pimienta"
      },
      {
        "en": "butter",
        "es": "mantequilla"
      },
      {
        "en": "dessert",
        "es": "postre"
      },
      {
        "en": "ice cream",
        "es": "helado"
      },
      {
        "en": "breakfast",
        "es": "desayuno"
      }
    ]
  },
  {
    "id": 9,
    "title": "Restaurant & Ordering",
    "cards": [
      {
        "en": "the menu",
        "es": "el menú"
      },
      {
        "en": "the bill",
        "es": "la cuenta"
      },
      {
        "en": "waiter",
        "es": "mesero"
      },
      {
        "en": "waitress",
        "es": "mesera"
      },
      {
        "en": "a table for two",
        "es": "una mesa para dos"
      },
      {
        "en": "I would like...",
        "es": "quisiera..."
      },
      {
        "en": "I want",
        "es": "quiero"
      },
      {
        "en": "the reservation",
        "es": "la reservación"
      },
      {
        "en": "could I have the menu?",
        "es": "¿Me puede traer el menú?"
      },
      {
        "en": "what do you recommend?",
        "es": "¿Qué me recomienda?"
      },
      {
        "en": "I'm hungry",
        "es": "tengo hambre"
      },
      {
        "en": "I'm thirsty",
        "es": "tengo sed"
      },
      {
        "en": "is this dish spicy?",
        "es": "¿Este plato es picante?"
      },
      {
        "en": "a glass of wine",
        "es": "una copa de vino"
      },
      {
        "en": "a table for four",
        "es": "una mesa para cuatro"
      },
      {
        "en": "do you have vegetarian options?",
        "es": "¿Tiene opciones vegetarianas?"
      },
      {
        "en": "delicious",
        "es": "delicioso"
      },
      {
        "en": "tip",
        "es": "propina"
      },
      {
        "en": "to order (food)",
        "es": "pedir"
      },
      {
        "en": "I'll have the chicken",
        "es": "voy a pedir el pollo"
      },
      {
        "en": "the specialty of the house",
        "es": "la especialidad de la casa"
      },
      {
        "en": "a bottle of water",
        "es": "una botella de agua"
      },
      {
        "en": "without ice",
        "es": "sin hielo"
      },
      {
        "en": "well done (meat)",
        "es": "bien cocido"
      },
      {
        "en": "medium rare",
        "es": "término medio"
      },
      {
        "en": "to go / takeout",
        "es": "para llevar"
      },
      {
        "en": "the restaurant",
        "es": "el restaurante"
      },
      {
        "en": "enjoy your meal",
        "es": "buen provecho"
      },
      {
        "en": "the check, please",
        "es": "la cuenta, por favor"
      },
      {
        "en": "is the tip included?",
        "es": "¿La propina está incluida?"
      }
    ]
  },
  {
    "id": 10,
    "title": "House & Furniture",
    "cards": [
      {
        "en": "house",
        "es": "casa"
      },
      {
        "en": "apartment",
        "es": "apartamento"
      },
      {
        "en": "room",
        "es": "habitación"
      },
      {
        "en": "kitchen",
        "es": "cocina"
      },
      {
        "en": "bathroom",
        "es": "baño"
      },
      {
        "en": "bedroom",
        "es": "dormitorio"
      },
      {
        "en": "living room",
        "es": "sala"
      },
      {
        "en": "dining room",
        "es": "comedor"
      },
      {
        "en": "garden",
        "es": "jardín"
      },
      {
        "en": "garage",
        "es": "garaje"
      },
      {
        "en": "door",
        "es": "puerta"
      },
      {
        "en": "window",
        "es": "ventana"
      },
      {
        "en": "wall",
        "es": "pared"
      },
      {
        "en": "floor",
        "es": "piso"
      },
      {
        "en": "roof",
        "es": "techo"
      },
      {
        "en": "table",
        "es": "mesa"
      },
      {
        "en": "chair",
        "es": "silla"
      },
      {
        "en": "bed",
        "es": "cama"
      },
      {
        "en": "sofa",
        "es": "sofá"
      },
      {
        "en": "lamp",
        "es": "lámpara"
      },
      {
        "en": "mirror",
        "es": "espejo"
      },
      {
        "en": "closet",
        "es": "armario"
      },
      {
        "en": "shelf",
        "es": "estante"
      },
      {
        "en": "refrigerator",
        "es": "refrigerador"
      },
      {
        "en": "stove",
        "es": "estufa"
      },
      {
        "en": "sink",
        "es": "fregadero"
      },
      {
        "en": "television",
        "es": "televisor"
      },
      {
        "en": "key",
        "es": "llave"
      },
      {
        "en": "stairs",
        "es": "escalera"
      },
      {
        "en": "curtain",
        "es": "cortina"
      }
    ]
  },
  {
    "id": 11,
    "title": "Clothing",
    "cards": [
      {
        "en": "shirt",
        "es": "camisa"
      },
      {
        "en": "t-shirt",
        "es": "camiseta"
      },
      {
        "en": "pants",
        "es": "pantalones"
      },
      {
        "en": "shorts",
        "es": "pantalones cortos"
      },
      {
        "en": "dress",
        "es": "vestido"
      },
      {
        "en": "skirt",
        "es": "falda"
      },
      {
        "en": "jacket",
        "es": "chaqueta"
      },
      {
        "en": "coat",
        "es": "abrigo"
      },
      {
        "en": "sweater",
        "es": "suéter"
      },
      {
        "en": "shoes",
        "es": "zapatos"
      },
      {
        "en": "socks",
        "es": "calcetines"
      },
      {
        "en": "hat",
        "es": "sombrero"
      },
      {
        "en": "cap",
        "es": "gorra"
      },
      {
        "en": "gloves",
        "es": "guantes"
      },
      {
        "en": "scarf",
        "es": "bufanda"
      },
      {
        "en": "belt",
        "es": "cinturón"
      },
      {
        "en": "tie",
        "es": "corbata"
      },
      {
        "en": "suit",
        "es": "traje"
      },
      {
        "en": "underwear",
        "es": "ropa interior"
      },
      {
        "en": "pajamas",
        "es": "pijama"
      },
      {
        "en": "boots",
        "es": "botas"
      },
      {
        "en": "sandals",
        "es": "sandalias"
      },
      {
        "en": "sunglasses",
        "es": "gafas de sol"
      },
      {
        "en": "glasses",
        "es": "gafas"
      },
      {
        "en": "watch",
        "es": "reloj"
      },
      {
        "en": "umbrella",
        "es": "paraguas"
      },
      {
        "en": "backpack",
        "es": "mochila"
      },
      {
        "en": "purse",
        "es": "bolso"
      },
      {
        "en": "swimsuit",
        "es": "traje de baño"
      },
      {
        "en": "size (clothing)",
        "es": "talla"
      }
    ]
  },
  {
    "id": 12,
    "title": "Weather & Seasons",
    "cards": [
      {
        "en": "weather",
        "es": "clima"
      },
      {
        "en": "it's sunny",
        "es": "hace sol"
      },
      {
        "en": "it's raining",
        "es": "está lloviendo"
      },
      {
        "en": "it's cold",
        "es": "hace frío"
      },
      {
        "en": "it's hot",
        "es": "hace calor"
      },
      {
        "en": "it's windy",
        "es": "hace viento"
      },
      {
        "en": "it's cloudy",
        "es": "está nublado"
      },
      {
        "en": "it's snowing",
        "es": "está nevando"
      },
      {
        "en": "storm",
        "es": "tormenta"
      },
      {
        "en": "rain",
        "es": "lluvia"
      },
      {
        "en": "snow",
        "es": "nieve"
      },
      {
        "en": "wind",
        "es": "viento"
      },
      {
        "en": "sun",
        "es": "sol"
      },
      {
        "en": "cloud",
        "es": "nube"
      },
      {
        "en": "sky",
        "es": "cielo"
      },
      {
        "en": "temperature",
        "es": "temperatura"
      },
      {
        "en": "spring",
        "es": "primavera"
      },
      {
        "en": "summer",
        "es": "verano"
      },
      {
        "en": "autumn",
        "es": "otoño"
      },
      {
        "en": "winter",
        "es": "invierno"
      },
      {
        "en": "season",
        "es": "estación"
      },
      {
        "en": "humid",
        "es": "húmedo"
      },
      {
        "en": "dry",
        "es": "seco"
      },
      {
        "en": "foggy",
        "es": "hay niebla"
      },
      {
        "en": "degrees",
        "es": "grados"
      },
      {
        "en": "thunder",
        "es": "trueno"
      },
      {
        "en": "lightning",
        "es": "relámpago"
      },
      {
        "en": "rainbow",
        "es": "arcoíris"
      },
      {
        "en": "forecast",
        "es": "pronóstico"
      },
      {
        "en": "hail",
        "es": "granizo"
      }
    ]
  },
  {
    "id": 13,
    "title": "Body Parts & Health",
    "cards": [
      {
        "en": "head",
        "es": "cabeza"
      },
      {
        "en": "hair",
        "es": "pelo"
      },
      {
        "en": "eye",
        "es": "ojo"
      },
      {
        "en": "ear",
        "es": "oreja"
      },
      {
        "en": "nose",
        "es": "nariz"
      },
      {
        "en": "mouth",
        "es": "boca"
      },
      {
        "en": "tooth",
        "es": "diente"
      },
      {
        "en": "tongue",
        "es": "lengua"
      },
      {
        "en": "neck",
        "es": "cuello"
      },
      {
        "en": "shoulder",
        "es": "hombro"
      },
      {
        "en": "arm",
        "es": "brazo"
      },
      {
        "en": "hand",
        "es": "mano"
      },
      {
        "en": "finger",
        "es": "dedo"
      },
      {
        "en": "chest",
        "es": "pecho"
      },
      {
        "en": "back",
        "es": "espalda"
      },
      {
        "en": "stomach",
        "es": "estómago"
      },
      {
        "en": "leg",
        "es": "pierna"
      },
      {
        "en": "knee",
        "es": "rodilla"
      },
      {
        "en": "foot",
        "es": "pie"
      },
      {
        "en": "skin",
        "es": "piel"
      },
      {
        "en": "heart",
        "es": "corazón"
      },
      {
        "en": "bone",
        "es": "hueso"
      },
      {
        "en": "blood",
        "es": "sangre"
      },
      {
        "en": "I have a headache",
        "es": "me duele la cabeza"
      },
      {
        "en": "I feel sick",
        "es": "me siento mal"
      },
      {
        "en": "fever",
        "es": "fiebre"
      },
      {
        "en": "doctor",
        "es": "médico"
      },
      {
        "en": "pharmacy",
        "es": "farmacia"
      },
      {
        "en": "medicine",
        "es": "medicina"
      },
      {
        "en": "I have a cold",
        "es": "tengo un resfriado"
      }
    ]
  },
  {
    "id": 14,
    "title": "Travel & Transportation",
    "cards": [
      {
        "en": "airport",
        "es": "aeropuerto"
      },
      {
        "en": "airplane",
        "es": "avión"
      },
      {
        "en": "train",
        "es": "tren"
      },
      {
        "en": "bus",
        "es": "autobús"
      },
      {
        "en": "car",
        "es": "carro"
      },
      {
        "en": "taxi",
        "es": "taxi"
      },
      {
        "en": "bicycle",
        "es": "bicicleta"
      },
      {
        "en": "ship",
        "es": "barco"
      },
      {
        "en": "subway",
        "es": "metro"
      },
      {
        "en": "ticket",
        "es": "boleto"
      },
      {
        "en": "passport",
        "es": "pasaporte"
      },
      {
        "en": "suitcase",
        "es": "maleta"
      },
      {
        "en": "luggage",
        "es": "equipaje"
      },
      {
        "en": "flight",
        "es": "vuelo"
      },
      {
        "en": "departure",
        "es": "salida"
      },
      {
        "en": "arrival",
        "es": "llegada"
      },
      {
        "en": "one-way ticket",
        "es": "boleto de ida"
      },
      {
        "en": "round-trip ticket",
        "es": "boleto de ida y vuelta"
      },
      {
        "en": "gate (airport)",
        "es": "puerta de embarque"
      },
      {
        "en": "boarding pass",
        "es": "pase de abordar"
      },
      {
        "en": "customs",
        "es": "aduana"
      },
      {
        "en": "border",
        "es": "frontera"
      },
      {
        "en": "driver's license",
        "es": "licencia de conducir"
      },
      {
        "en": "seatbelt",
        "es": "cinturón de seguridad"
      },
      {
        "en": "traffic",
        "es": "tráfico"
      },
      {
        "en": "highway",
        "es": "autopista"
      },
      {
        "en": "station",
        "es": "estación"
      },
      {
        "en": "port",
        "es": "puerto"
      },
      {
        "en": "map",
        "es": "mapa"
      },
      {
        "en": "tourist",
        "es": "turista"
      }
    ]
  },
  {
    "id": 15,
    "title": "Directions & Prepositions",
    "cards": [
      {
        "en": "left",
        "es": "izquierda"
      },
      {
        "en": "right",
        "es": "derecha"
      },
      {
        "en": "straight ahead",
        "es": "derecho"
      },
      {
        "en": "near",
        "es": "cerca"
      },
      {
        "en": "far",
        "es": "lejos"
      },
      {
        "en": "here",
        "es": "aquí"
      },
      {
        "en": "there",
        "es": "allí"
      },
      {
        "en": "in front of",
        "es": "enfrente de"
      },
      {
        "en": "behind",
        "es": "detrás de"
      },
      {
        "en": "next to",
        "es": "al lado de"
      },
      {
        "en": "between",
        "es": "entre"
      },
      {
        "en": "above",
        "es": "encima de"
      },
      {
        "en": "below",
        "es": "debajo de"
      },
      {
        "en": "inside",
        "es": "dentro de"
      },
      {
        "en": "outside",
        "es": "fuera de"
      },
      {
        "en": "north",
        "es": "norte"
      },
      {
        "en": "south",
        "es": "sur"
      },
      {
        "en": "east",
        "es": "este"
      },
      {
        "en": "west",
        "es": "oeste"
      },
      {
        "en": "corner",
        "es": "esquina"
      },
      {
        "en": "block (street)",
        "es": "cuadra"
      },
      {
        "en": "street",
        "es": "calle"
      },
      {
        "en": "avenue",
        "es": "avenida"
      },
      {
        "en": "turn left",
        "es": "doble a la izquierda"
      },
      {
        "en": "turn right",
        "es": "doble a la derecha"
      },
      {
        "en": "go straight",
        "es": "siga derecho"
      },
      {
        "en": "where is...?",
        "es": "¿Dónde está...?"
      },
      {
        "en": "how do I get to...?",
        "es": "¿Cómo llego a...?"
      },
      {
        "en": "on top of",
        "es": "sobre"
      },
      {
        "en": "far from",
        "es": "lejos de"
      }
    ]
  },
  {
    "id": 16,
    "title": "Shopping & Money",
    "cards": [
      {
        "en": "money",
        "es": "dinero"
      },
      {
        "en": "price",
        "es": "precio"
      },
      {
        "en": "expensive",
        "es": "caro"
      },
      {
        "en": "cheap",
        "es": "barato"
      },
      {
        "en": "discount",
        "es": "descuento"
      },
      {
        "en": "cash",
        "es": "efectivo"
      },
      {
        "en": "credit card",
        "es": "tarjeta de crédito"
      },
      {
        "en": "receipt",
        "es": "recibo"
      },
      {
        "en": "store",
        "es": "tienda"
      },
      {
        "en": "market",
        "es": "mercado"
      },
      {
        "en": "mall",
        "es": "centro comercial"
      },
      {
        "en": "to buy",
        "es": "comprar"
      },
      {
        "en": "to sell",
        "es": "vender"
      },
      {
        "en": "to pay",
        "es": "pagar"
      },
      {
        "en": "change (money)",
        "es": "cambio"
      },
      {
        "en": "how much does it cost?",
        "es": "¿Cuánto cuesta?"
      },
      {
        "en": "I would like to buy...",
        "es": "me gustaría comprar..."
      },
      {
        "en": "can I try it on?",
        "es": "¿Me lo puedo probar?"
      },
      {
        "en": "size (general)",
        "es": "talla"
      },
      {
        "en": "free (no cost)",
        "es": "gratis"
      },
      {
        "en": "sale",
        "es": "oferta"
      },
      {
        "en": "coin",
        "es": "moneda"
      },
      {
        "en": "bill (money)",
        "es": "billete"
      },
      {
        "en": "wallet",
        "es": "cartera"
      },
      {
        "en": "bag",
        "es": "bolsa"
      },
      {
        "en": "shopping cart",
        "es": "carrito"
      },
      {
        "en": "cashier",
        "es": "cajero"
      },
      {
        "en": "open (store status)",
        "es": "abierto"
      },
      {
        "en": "closed (store status)",
        "es": "cerrado"
      },
      {
        "en": "refund",
        "es": "reembolso"
      }
    ]
  },
  {
    "id": 17,
    "title": "Emotions & Feelings",
    "cards": [
      {
        "en": "I am happy",
        "es": "estoy feliz"
      },
      {
        "en": "I am sad",
        "es": "estoy triste"
      },
      {
        "en": "I am tired",
        "es": "estoy cansado"
      },
      {
        "en": "I am angry",
        "es": "estoy enojado"
      },
      {
        "en": "I am scared",
        "es": "estoy asustado"
      },
      {
        "en": "I am nervous",
        "es": "estoy nervioso"
      },
      {
        "en": "I am worried",
        "es": "estoy preocupado"
      },
      {
        "en": "I am bored",
        "es": "estoy aburrido"
      },
      {
        "en": "I am excited",
        "es": "estoy emocionado"
      },
      {
        "en": "I am surprised",
        "es": "estoy sorprendido"
      },
      {
        "en": "I am in love",
        "es": "estoy enamorado"
      },
      {
        "en": "I am confused",
        "es": "estoy confundido"
      },
      {
        "en": "I am proud",
        "es": "estoy orgulloso"
      },
      {
        "en": "I am embarrassed",
        "es": "estoy avergonzado"
      },
      {
        "en": "I am calm",
        "es": "estoy tranquilo"
      },
      {
        "en": "I am jealous",
        "es": "estoy celoso"
      },
      {
        "en": "I am grateful",
        "es": "estoy agradecido"
      },
      {
        "en": "I am lonely",
        "es": "me siento solo"
      },
      {
        "en": "I am stressed",
        "es": "estoy estresado"
      },
      {
        "en": "I feel good",
        "es": "me siento bien"
      },
      {
        "en": "I feel bad",
        "es": "me siento mal"
      },
      {
        "en": "love (noun)",
        "es": "amor"
      },
      {
        "en": "fear",
        "es": "miedo"
      },
      {
        "en": "anger",
        "es": "enojo"
      },
      {
        "en": "joy",
        "es": "alegría"
      },
      {
        "en": "laughter",
        "es": "risa"
      },
      {
        "en": "tears",
        "es": "lágrimas"
      },
      {
        "en": "to cry",
        "es": "llorar"
      },
      {
        "en": "to laugh",
        "es": "reír"
      },
      {
        "en": "to smile",
        "es": "sonreír"
      }
    ]
  },
  {
    "id": 18,
    "title": "Common Questions",
    "cards": [
      {
        "en": "what?",
        "es": "¿Qué?"
      },
      {
        "en": "who?",
        "es": "¿Quién?"
      },
      {
        "en": "when?",
        "es": "¿Cuándo?"
      },
      {
        "en": "where?",
        "es": "¿Dónde?"
      },
      {
        "en": "why?",
        "es": "¿Por qué?"
      },
      {
        "en": "how?",
        "es": "¿Cómo?"
      },
      {
        "en": "how much?",
        "es": "¿Cuánto?"
      },
      {
        "en": "how many?",
        "es": "¿Cuántos?"
      },
      {
        "en": "which?",
        "es": "¿Cuál?"
      },
      {
        "en": "what is this?",
        "es": "¿Qué es esto?"
      },
      {
        "en": "what time is it?",
        "es": "¿Qué hora es?"
      },
      {
        "en": "where is the bathroom?",
        "es": "¿Dónde está el baño?"
      },
      {
        "en": "how much does it cost?",
        "es": "¿Cuánto cuesta?"
      },
      {
        "en": "do you speak English?",
        "es": "¿Hablas inglés?"
      },
      {
        "en": "can you help me?",
        "es": "¿Me puedes ayudar?"
      },
      {
        "en": "what does that mean?",
        "es": "¿Qué significa eso?"
      },
      {
        "en": "how do you say...?",
        "es": "¿Cómo se dice...?"
      },
      {
        "en": "is this correct?",
        "es": "¿Esto es correcto?"
      },
      {
        "en": "do you understand?",
        "es": "¿Entiendes?"
      },
      {
        "en": "what are you doing?",
        "es": "¿Qué estás haciendo?"
      },
      {
        "en": "where do you live?",
        "es": "¿Dónde vives?"
      },
      {
        "en": "what do you like?",
        "es": "¿Qué te gusta?"
      },
      {
        "en": "who is that?",
        "es": "¿Quién es ese?"
      },
      {
        "en": "why not?",
        "es": "¿Por qué no?"
      },
      {
        "en": "can I ask you something?",
        "es": "¿Puedo preguntarte algo?"
      },
      {
        "en": "what's wrong?",
        "es": "¿Qué pasa?"
      },
      {
        "en": "are you sure?",
        "es": "¿Estás seguro?"
      },
      {
        "en": "what do you need?",
        "es": "¿Qué necesitas?"
      },
      {
        "en": "is it far?",
        "es": "¿Está lejos?"
      },
      {
        "en": "what day is it?",
        "es": "¿Qué día es hoy?"
      }
    ]
  },
  {
    "id": 19,
    "title": "Useful Everyday Phrases",
    "cards": [
      {
        "en": "I don't understand",
        "es": "No entiendo."
      },
      {
        "en": "Can you repeat that, please?",
        "es": "¿Puedes repetirlo, por favor?"
      },
      {
        "en": "Speak more slowly, please",
        "es": "Habla más despacio, por favor."
      },
      {
        "en": "I don't know",
        "es": "No sé."
      },
      {
        "en": "I think so",
        "es": "Creo que sí."
      },
      {
        "en": "I don't think so",
        "es": "Creo que no."
      },
      {
        "en": "It doesn't matter",
        "es": "No importa."
      },
      {
        "en": "What a pity!",
        "es": "¡Qué lástima!"
      },
      {
        "en": "Congratulations!",
        "es": "¡Felicidades!"
      },
      {
        "en": "Good luck!",
        "es": "¡Buena suerte!"
      },
      {
        "en": "Be careful!",
        "es": "¡Ten cuidado!"
      },
      {
        "en": "Watch out!",
        "es": "¡Cuidado!"
      },
      {
        "en": "I need help",
        "es": "Necesito ayuda."
      },
      {
        "en": "Where is the nearest pharmacy?",
        "es": "¿Dónde está la farmacia más cercana?"
      },
      {
        "en": "I'm lost",
        "es": "Estoy perdido."
      },
      {
        "en": "What a shame!",
        "es": "¡Qué pena!"
      },
      {
        "en": "Let's go!",
        "es": "¡Vamos!"
      },
      {
        "en": "It's my pleasure",
        "es": "Es un placer."
      },
      {
        "en": "No problem",
        "es": "No hay problema."
      },
      {
        "en": "Of course",
        "es": "Claro que sí."
      },
      {
        "en": "I agree",
        "es": "Estoy de acuerdo."
      },
      {
        "en": "I disagree",
        "es": "No estoy de acuerdo."
      },
      {
        "en": "That's amazing!",
        "es": "¡Eso es increíble!"
      },
      {
        "en": "I'm just looking, thanks",
        "es": "Solo estoy mirando, gracias."
      },
      {
        "en": "How was your day?",
        "es": "¿Cómo estuvo tu día?"
      },
      {
        "en": "Make yourself at home",
        "es": "Siéntete como en casa."
      },
      {
        "en": "It's up to you",
        "es": "Depende de ti."
      },
      {
        "en": "I miss you",
        "es": "Te extraño."
      },
      {
        "en": "See you next week",
        "es": "Nos vemos la próxima semana."
      },
      {
        "en": "Take it easy",
        "es": "Tómalo con calma."
      }
    ]
  },
  {
    "id": 20,
    "title": "Mixed Review / Higher-Difficulty Phrases",
    "cards": [
      {
        "en": "I have been studying Spanish for two years",
        "es": "He estudiado español por dos años."
      },
      {
        "en": "If I had more time, I would travel more",
        "es": "Si tuviera más tiempo, viajaría más."
      },
      {
        "en": "I would like to make a reservation for tonight",
        "es": "Quisiera hacer una reservación para esta noche."
      },
      {
        "en": "Could you tell me how to get to the train station?",
        "es": "¿Podría decirme cómo llegar a la estación de tren?"
      },
      {
        "en": "I have never been to Spain",
        "es": "Nunca he estado en España."
      },
      {
        "en": "We are going to visit my grandparents next weekend",
        "es": "Vamos a visitar a mis abuelos el próximo fin de semana."
      },
      {
        "en": "It is important to practice every day",
        "es": "Es importante practicar todos los días."
      },
      {
        "en": "I hope you have a wonderful trip",
        "es": "Espero que tengas un viaje maravilloso."
      },
      {
        "en": "She works as a doctor at the hospital",
        "es": "Ella trabaja como médica en el hospital."
      },
      {
        "en": "Although it was raining, we went for a walk",
        "es": "Aunque estaba lloviendo, salimos a caminar."
      },
      {
        "en": "What would you do in my situation?",
        "es": "¿Qué harías en mi situación?"
      },
      {
        "en": "I'm sorry for the inconvenience",
        "es": "Disculpe las molestias."
      },
      {
        "en": "The meeting has been postponed until Friday",
        "es": "La reunión se ha pospuesto hasta el viernes."
      },
      {
        "en": "He said that he would call me later",
        "es": "Dijo que me llamaría más tarde."
      },
      {
        "en": "I need to renew my passport before traveling",
        "es": "Necesito renovar mi pasaporte antes de viajar."
      },
      {
        "en": "Let me know if you need anything else",
        "es": "Avísame si necesitas algo más."
      },
      {
        "en": "It's not as difficult as it seems",
        "es": "No es tan difícil como parece."
      },
      {
        "en": "I was born and raised in this city",
        "es": "Nací y crecí en esta ciudad."
      },
      {
        "en": "We have to finish this project by tomorrow",
        "es": "Tenemos que terminar este proyecto para mañana."
      },
      {
        "en": "Do you mind if I open the window?",
        "es": "¿Te molesta si abro la ventana?"
      },
      {
        "en": "I would appreciate your help with this",
        "es": "Agradecería tu ayuda con esto."
      },
      {
        "en": "The more I practice, the better I get",
        "es": "Cuanto más practico, mejor me pongo."
      },
      {
        "en": "I'm looking forward to seeing you soon",
        "es": "Tengo muchas ganas de verte pronto."
      },
      {
        "en": "It took us three hours to get there",
        "es": "Nos tomó tres horas llegar allí."
      },
      {
        "en": "I wish I could stay longer",
        "es": "Ojalá pudiera quedarme más tiempo."
      },
      {
        "en": "Please make sure to lock the door",
        "es": "Por favor, asegúrate de cerrar la puerta con llave."
      },
      {
        "en": "This is the best decision I have ever made",
        "es": "Esta es la mejor decisión que he tomado."
      },
      {
        "en": "He apologized for being late",
        "es": "Se disculpó por llegar tarde."
      },
      {
        "en": "Everything will be fine in the end",
        "es": "Todo estará bien al final."
      },
      {
        "en": "Thank you for your patience and understanding",
        "es": "Gracias por tu paciencia y comprensión."
      }
    ]
  }
];
