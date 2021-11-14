const { fn } = require("sequelize");
const Sequelize = require("sequelize");
const db = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/dealers_choice_sequelize_db"
);
const { STRING, INTEGER, UUID, UUIDV4, DATEONLY, DECIMAL, NOW, DATE } = Sequelize;

const Theater = db.define("theater", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: STRING,
    unique: true,
    allowNull: false,
  },
  address: {
    type: STRING,
    allowNull: false,
  },
});

const Customer = db.define("customer", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  first_name: {
    type: STRING,
    unique: true,
    allowNull: false,
  },
  last_name: {
    type: STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
});

const Movie = db.define("movie", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: STRING,
    allowNull: false,
  },
  releaseDate: {
    type: DATEONLY,
    allowNull: false,
  },
  MPAA: {
    type: STRING,
    allowNull: false,
  },
  genre: {
    type: STRING,
    allowNull: false,
  },
  expectedDailyRevenue: {
    type: INTEGER,
    },
    coverPhoto: {
      type: STRING
  }
});

const Purchase = db.define("purchase", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  price: {
    type: INTEGER,
    allowNull: false,
  },
  seatNumber: {
    type: STRING,
  },
  showTime: {
    type: DATE,
    defaultValue: NOW,
  },
});

const Movie_Theater = db.define("movie_theater", {});

Movie.hasMany(Purchase)
Purchase.belongsTo(Movie)
Customer.hasMany(Purchase)
Purchase.belongsTo(Customer)
Theater.hasMany(Purchase)
Purchase.belongsTo(Theater)

// Movie_Theater is a join table that depicts a many-to-many relationship b/t Movie and Theater
Movie_Theater.belongsTo(Movie)
Movie_Theater.belongsTo(Theater)
Movie.hasMany(Movie_Theater)
Theater.hasMany(Movie_Theater)

// CLASS METHODS 
Movie_Theater.groupBy = async function(type) {
    const moviesAndTheatersJSON = await Movie_Theater.findAll({
        include: [Movie, Theater],
    });
    const groupedData = {}

    async function reorganize(type, counterType) {
        await moviesAndTheatersJSON.forEach((rowInMovie_Theater) => {
            if (groupedData[rowInMovie_Theater[type].id]) {
            groupedData[rowInMovie_Theater[type].id].push(
                rowInMovie_Theater[counterType]
            );
            } else {
            groupedData[rowInMovie_Theater[type].id] = [
                rowInMovie_Theater[counterType],
            ];
            }
        });
    };
    if (type === 'movie') {
        reorganize(type, 'theater');
    } else {
        reorganize(type, 'movie')
    }
    return groupedData
};


const groupByUnique = async(purchases, id) => {
  const groupedPurchases = {};
  // organizes the purchases by id
  await purchases.forEach((purchase) => {
    groupedPurchases[purchase[id]]
      ? groupedPurchases[purchase[id]].push(purchase)
      : (groupedPurchases[purchase[id]] = [purchase]);
  });
  return groupedPurchases;
}

Purchase.groupByUniqueMovie = async function (theaterId) {
    // gets purchases in a specific theater as filtered by theaterId
    const purchasesInTheater = await Purchase.findAll({
        where: {
            theaterId,
        },
        include: [Movie, Customer],
    });
    return groupByUnique(purchasesInTheater, 'movieId')
};

Purchase.groupByUniqueTheater = async function (movieId) {
  // gets purchases in a specific movie as filtered by movieId
    const purchasesInMovie = await Purchase.findAll({
        where: {
            movieId,
        },
        include: [Theater, Customer],
    });
    return groupByUnique(purchasesInMovie, "theaterId");

};

const theaters = [
  ["Orpheum 7", "1538 3rd Ave"],
  ["84th Street 6", "2310 Broadway"],
  ["Magic Johnson Harlem 9", "2309 Frederick Douglass Blvd"],
  ["Ridgefield Park 12", "75 Challenger Rd"],
  ["Kips Bay 15", "570 2nd Ave"],
  ["Village 7", "66 3rd Ave"],
  ["19th St. East 6", "890 Broadway"],
  ["34th Street 14", "312 W 34th St"],
];
const customers = [
    ["Kirsten", "Dunst", "kirstendunst@gmail.com"],
    ["Viola", "Davis", "violadavis@gmail.com"],
  ["Angie", "Jolie", "angiejolie@gmail.com"],
  ["Julia", "Roberts", "juliaroberts@gmail.com"],
  ["Denzel", "Washington", "denzelwashington@gmail.com"],
  ["Brad", "Pitt", "bradpitt@gmail.com"],
  ["Harry", "Shum", "harryshum@gmail.com"],
  ["John", "Cho", "johncho@gmail.com"],
];
const movies = [
  ["Eternals", "2021-11-05", "PG13", "Action", 340000, "eternals.jpg"],
  ["The French Dispatch", "2021-10-22", "R", "Comedy", 220000, "the-french-dispatch.jpg"],
  ["Belfast", "2021-11-12", "PG13", "Drama", 90000, 'belfast.jpg'],
  ["Dune", "2021-10-22", "PG13", "Action", 550000, 'dune.jpeg'],
  ["Spencer", "2021-11-05", "R", "Drama", 170000, 'spencer.jpeg'],
  ["American Sniper", "2021-11-11", "R", "Action", 120000, 'american-sniper.jpg'],
  ["Venom: Let There Be Carnage", "2021-10-01", "PG13", "Action", 290000, 'venom.jpg'],
  ["No Time To Die", "2021-10-08", "PG13", "Action", 390000, 'no-time-to-die.jpg'],
];

const syncAndSeed = async () => {
  await db.sync({ force: true });
  const [t1, t2, t3, t4, t5, t6, t7, t8 ] = await Promise.all(
    theaters.map((theater) => {
      return Theater.create({
        name: theater[0],
        address: theater[1],
      });
    })
  );
    
    const [c1, c2, c3, c4, c5, c6, c7, c8] = await Promise.all(
        customers.map(customer => {
            return Customer.create({
                first_name: customer[0],
                last_name: customer[1],
                email: customer[2]
            })
        })
    );
    
    const [m1, m2, m3, m4, m5, m6, m7, m8] = await Promise.all(
        movies.map(movie => {
            return Movie.create({
              title: movie[0],
              releaseDate:movie[1],
              MPAA: movie[2],
              genre: movie[3],
                expectedDailyRevenue: movie[4],
              coverPhoto: movie[5]
            });
        })
    )

    await Promise.all([
      Movie_Theater.create({ movieId: m1.id, theaterId: t1.id }),
      Movie_Theater.create({ movieId: m2.id, theaterId: t1.id }),
      Movie_Theater.create({ movieId: m3.id, theaterId: t1.id }),
      Movie_Theater.create({ movieId: m4.id, theaterId: t1.id }),
      Movie_Theater.create({ movieId: m1.id, theaterId: t2.id }),
      Movie_Theater.create({ movieId: m2.id, theaterId: t2.id }),
      Movie_Theater.create({ movieId: m7.id, theaterId: t2.id }),
      Movie_Theater.create({ movieId: m5.id, theaterId: t2.id }),
      Movie_Theater.create({ movieId: m1.id, theaterId: t3.id }),
      Movie_Theater.create({ movieId: m5.id, theaterId: t3.id }),
      Movie_Theater.create({ movieId: m8.id, theaterId: t3.id }),
      Movie_Theater.create({ movieId: m4.id, theaterId: t3.id }),
      Movie_Theater.create({ movieId: m1.id, theaterId: t4.id }),
      Movie_Theater.create({ movieId: m2.id, theaterId: t4.id }),
      Movie_Theater.create({ movieId: m3.id, theaterId: t4.id }),
      Movie_Theater.create({ movieId: m7.id, theaterId: t4.id }),
      Movie_Theater.create({ movieId: m4.id, theaterId: t5.id }),
      Movie_Theater.create({ movieId: m5.id, theaterId: t5.id }),
      Movie_Theater.create({ movieId: m6.id, theaterId: t5.id }),
      Movie_Theater.create({ movieId: m7.id, theaterId: t5.id }),
      Movie_Theater.create({ movieId: m3.id, theaterId: t6.id }),
      Movie_Theater.create({ movieId: m4.id, theaterId: t6.id }),
      Movie_Theater.create({ movieId: m5.id, theaterId: t6.id }),
      Movie_Theater.create({ movieId: m6.id, theaterId: t6.id }),
      Movie_Theater.create({ movieId: m7.id, theaterId: t7.id }),
      Movie_Theater.create({ movieId: m8.id, theaterId: t7.id }),
      Movie_Theater.create({ movieId: m3.id, theaterId: t7.id }),
      Movie_Theater.create({ movieId: m2.id, theaterId: t7.id }),
      Movie_Theater.create({ movieId: m1.id, theaterId: t8.id }),
      Movie_Theater.create({ movieId: m2.id, theaterId: t8.id }),
      Movie_Theater.create({ movieId: m7.id, theaterId: t8.id }),
      Movie_Theater.create({ movieId: m8.id, theaterId: t8.id }),
    ]);

    await Promise.all([
        Purchase.create({ price: 3, seatNumber: 'G2', showTime: '2021-10-05 12:30', movieId: m1.id, customerId: c1.id, theaterId: t1.id }),
        Purchase.create({ price: 14, seatNumber: 'A4', showTime: '2021-11-02 13:15', movieId: m1.id, customerId: c2.id, theaterId: t3.id }),
        Purchase.create({ price: 14, seatNumber: 'B3', showTime: '2021-11-03 14:45', movieId: m1.id, customerId: c3.id, theaterId: t8.id }),
        Purchase.create({ price: 14, seatNumber: 'B6', showTime: '2021-11-12 15:30', movieId: m1.id, customerId: c4.id, theaterId: t3.id }),
        Purchase.create({ price: 14, seatNumber: 'K3', showTime: '2021-11-11 18:45', movieId: m1.id, customerId: c5.id, theaterId: t2.id }),
        Purchase.create({ price: 14, seatNumber: 'K2', showTime: '2021-10-20 12:10', movieId: m2.id, customerId: c6.id, theaterId: t4.id }),
        Purchase.create({ price: 3, seatNumber: 'C2', showTime: '2021-10-22 11:30', movieId: m2.id, customerId: c7.id, theaterId: t2.id }),
        Purchase.create({ price: 14, seatNumber: 'G4', showTime: '2021-11-01 12:30', movieId: m2.id, customerId: c8.id, theaterId: t1.id }),
        Purchase.create({ price: 3, seatNumber: 'G6', showTime: '2021-11-01 19:30', movieId: m2.id, customerId: c1.id, theaterId: t7.id }),
        Purchase.create({ price: 0, seatNumber: 'D3', showTime: '2021-11-10 15:30', movieId: m3.id, customerId: c2.id, theaterId: t7.id }),
        Purchase.create({ price: 7, seatNumber: 'E7', showTime: '2021-10-22 17:20', movieId: m3.id, customerId: c3.id, theaterId: t6.id }),
        Purchase.create({ price: 0, seatNumber: 'F1', showTime: '2021-10-23 19:15', movieId: m3.id, customerId: c4.id, theaterId: t1.id }),
        Purchase.create({ price: 7, seatNumber: 'F2', showTime: '2021-10-24 20:30', movieId: m3.id, customerId: c5.id, theaterId: t4.id }),
        Purchase.create({ price: 7, seatNumber: 'H2', showTime: '2021-10-25 22:30', movieId: m4.id, customerId: c6.id, theaterId: t1.id }),
        Purchase.create({ price: 20, seatNumber: 'H7', showTime: '2021-11-13 10:30', movieId: m4.id, customerId: c7.id, theaterId: t3.id }),
        Purchase.create({ price: 14, seatNumber: 'A3', showTime: '2021-11-06 12:30', movieId: m4.id, customerId: c8.id, theaterId: t5.id }),
        Purchase.create({ price: 14, seatNumber: 'C1', showTime: '2021-11-08 11:30', movieId: m4.id, customerId: c1.id, theaterId: t5.id }),
        Purchase.create({ price: 14, seatNumber: 'D3', showTime: '2021-11-09 14:30', movieId: m4.id, customerId: c2.id, theaterId: t6.id }),
        Purchase.create({ price: 14, seatNumber: 'D4', showTime: '2021-10-12 18:15', movieId: m5.id, customerId: c3.id, theaterId: t2.id }),
        Purchase.create({ price: 14, seatNumber: 'E5', showTime: '2021-10-14 19:20', movieId: m5.id, customerId: c4.id, theaterId: t3.id }),
        Purchase.create({ price: 14, seatNumber: 'E6', showTime: '2021-10-06 13:40', movieId: m5.id, customerId: c5.id, theaterId: t5.id }),
        Purchase.create({ price: 14, seatNumber: 'E6', showTime: '2021-10-09 15:40', movieId: m5.id, customerId: c6.id, theaterId: t6.id }),
        Purchase.create({ price: 14, seatNumber: 'B7', showTime: '2021-10-10 16:30', movieId: m5.id, customerId: c7.id, theaterId: t6.id }),
        Purchase.create({ price: 3, seatNumber: 'G1', showTime: '2021-10-11 20:30', movieId: m6.id, customerId: c8.id, theaterId: t5.id }),
        Purchase.create({ price: 14, seatNumber: 'D2', showTime: '2021-10-31 21:15', movieId: m6.id, customerId: c1.id, theaterId: t6.id }),
        Purchase.create({ price: 20, seatNumber: 'K3', showTime: '2021-10-30 21:15', movieId: m6.id, customerId: c5.id, theaterId: t5.id }),
        Purchase.create({ price: 7, seatNumber: 'K5', showTime: '2021-10-29 10:30', movieId: m6.id, customerId: c3.id, theaterId: t6.id }),
        Purchase.create({ price: 14, seatNumber: 'F2', showTime: '2021-10-28 11:30', movieId: m7.id, customerId: c4.id, theaterId: t2.id }),
        Purchase.create({ price: 14, seatNumber: 'F7', showTime: '2021-10-27 12:30', movieId: m7.id, customerId: c5.id, theaterId: t4.id }),
        Purchase.create({ price: 14, seatNumber: 'H2', showTime: '2021-11-01 14:30', movieId: m7.id, customerId: c5.id, theaterId: t5.id }),
        Purchase.create({ price: 14, seatNumber: 'H5', showTime: '2021-10-19 15:30', movieId: m7.id, customerId: c7.id, theaterId: t7.id }),
        Purchase.create({ price: 14, seatNumber: 'I8', showTime: '2021-10-17 16:30', movieId: m7.id, customerId: c8.id, theaterId: t8.id }),
        Purchase.create({ price: 14, seatNumber: 'I3', showTime: '2021-11-14 17:30', movieId: m7.id, customerId: c2.id, theaterId: t8.id }),
        Purchase.create({ price: 14, seatNumber: 'K2', showTime: '2021-11-13 19:30', movieId: m8.id, customerId: c1.id, theaterId: t3.id }),
        Purchase.create({ price: 20, seatNumber: 'G4', showTime: '2021-11-10 20:30', movieId: m8.id, customerId: c5.id, theaterId: t7.id }),
        Purchase.create({ price: 14, seatNumber: 'D1', showTime: '2021-11-09 22:30', movieId: m8.id, customerId: c7.id, theaterId: t7.id }),
        Purchase.create({ price: 20, seatNumber: 'E4', showTime: '2021-11-08 23:30', movieId: m8.id, customerId: c3.id, theaterId: t8.id }),
    ])
};

module.exports = {
  db,
  syncAndSeed,
  models: {
    Customer,
    Theater,
      Movie,
      Movie_Theater,
    Purchase
  },
};
