const Producto = require('../models/Producto');
const { create } = require('xmlbuilder2');

exports.generarFeedFacebook = async (req, res) => {
  try {
    // 1. Traer solo las gorras activas de la base de datos
    const productos = await Producto.find({ estado: 'activo' });

    // 2. Crear la estructura base del XML que exige Meta (formato RSS 2.0)
    const feedObj = {
      rss: {
        '@xmlns:g': 'http://base.google.com/ns/1.0',
        '@version': '2.0',
        channel: {
          title: 'Tienda Beisbolera - Catálogo de Gorras',
          link: 'https://tiendabeisbolera.onrender.com', // 👈 Dominio real de tu tienda en Render
          description: 'Catálogo oficial de gorras para Meta Commerce',
          item: [] // Aquí inyectaremos cada gorra iterando la base de datos
        }
      }
    };

    // 3. Llenar el arreglo de items mapeando los datos de Mongo a las etiquetas de Meta
    productos.forEach((gorra) => {
      feedObj.rss.channel.item.push({
        'g:id': gorra._id.toString(),
        'g:title': gorra.nombre,
        'g:description': gorra.descripcion || `Gorra ${gorra.tipo || ''} marca ${gorra.marca} color ${gorra.color}`,
        'g:link': `https://tiendabeisbolera.onrender.com/producto/${gorra.slug || gorra._id}`, // 👈 Enlace directo a cada producto en tu frontend
        'g:image_link': gorra.imagen_cloudinary_url,
        'g:brand': gorra.marca,
        'g:condition': 'new', // Siempre nuevo
        'g:availability': (gorra.stock > 0) ? 'in stock' : 'out of stock',
        'g:price': `${gorra.precio} COP` // Formato obligatorio: Valor + Moneda
      });
    });

    // 4. Convertir el objeto de JavaScript a XML real
    const xml = create(feedObj).end({ prettyPrint: true });

    // 5. Enviar la respuesta especificando que es un archivo XML
    res.header('Content-Type', 'application/xml');
    res.send(xml);

  } catch (error) {
    console.error('Error generando el XML de Meta:', error);
    res.status(500).send('Error interno generando el feed');
  }
};