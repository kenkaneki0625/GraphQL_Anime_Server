const express = require('express')
const expressGraphQL = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')
const app = express()

const genres = [
	{ id: 1, name: 'Shounen' },
	{ id: 2, name: 'Shoujo' },
]

const animes = [
	{ id: 1, name: 'Bungo Stray Dogs', genreId: 1 },
	{ id: 2, name: 'Attack on Titan', genreId: 1 },
	{ id: 3, name: 'Noragami', genreId: 1 },
	{ id: 4, name: 'Jujutsu Kaisen', genreId: 1 },
	{ id: 5, name: 'Demon Slayer', genreId: 1 },
	{ id: 6, name: 'Haikyuu', genreId: 1 },
	{ id: 7, name: 'Wotakoi', genreId: 2 },
	{ id: 8, name: 'Fruits Basket', genreId: 2 }
]

const characters = [
  { id: 1, name: 'Dasai Osamu', animeId: 1 },
  { id: 2, name: 'Nakahara Chuuya', animeId: 1 },
  { id: 3, name: 'Kamado Tanjiro', animeId: 5 },
  { id: 4, name: 'Kamado Nezuko', animeId: 5 },
  { id: 5, name: 'Levi Ackerman', animeId: 2 },
  { id: 6, name: 'Eren Yeager', animeId: 2 },
  { id: 7, name: 'Yaato', animeId: 3 },
  { id: 8, name: 'Hiyori', animeId: 3 },
  { id: 9, name: 'Gojo Satoru', animeId: 4 },
  { id: 10, name: 'Yuji Itadori', animeId: 4 },
  { id: 11, name: 'Hinata Shoyo', animeId: 6 },
  { id: 12, name: 'Hirotaka Nifuji', animeId: 7 },
  { id: 13, name: 'Tohru', animeId: 8 },

]

const AnimeType = new GraphQLObjectType({
  name: 'Anime',
  description: 'This represents an anime of a genre',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    genreId: { type: GraphQLNonNull(GraphQLInt) },
    genre: {
      type: GenreType,
      resolve: (anime) => {
        return genres.find(genre => genre.id === anime.genreId)
      }
    },
    characters: {
      type: new GraphQLList(AnimeType),
      resolve: (anime) => {
        return characters.filter(character => character.animeId === anime.id)
      }
    }
  })
})

const GenreType = new GraphQLObjectType({
  name: 'Genre',
  description: 'This represents a Genre of an anime',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    animes: {
      type: new GraphQLList(AnimeType),
      resolve: (genre) => {
        return animes.filter(anime => anime.genreId === genre.id)
      }
    }
  })
})

const CharacterType = new GraphQLObjectType({
  name: 'Character',
  description: 'This represents a Character of an anime',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    anime: {
      type: AnimeType,
      resolve: (character) => {
        return animes.find(anime => anime.id === character.animeId)
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    anime: {
      type: AnimeType,
      description: 'A Single Anime',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => animes.find(anime => anime.id === args.id)
    },
    animes: {
      type: new GraphQLList(AnimeType),
      description: 'List of All Anime',
      resolve: () => animes
    },
    genres: {
      type: new GraphQLList(GenreType),
      description: 'List of All Genre',
      resolve: () => genres
    },
    genre: {
      type: GenreType,
      description: 'A Single Genre',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => genres.find(genre => genre.id === args.id)
    },
    characters: {
      type: new GraphQLList(CharacterType),
      description: 'List of All Characters',
      resolve: () => characters
    },
    character: {
      type: CharacterType,
      description: 'A Single Character',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => characters.find(character => character.id === args.id)
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addAnime: {
      type: AnimeType,
      description: 'Add an anime',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        genreId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const anime = { id: animes.length + 1, name: args.name, genreId: args.genreId }
        animes.push(anime)
        return anime
      }
    },
    addGenre: {
      type: GenreType,
      description: 'Add an Genre',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const genre = { id: genres.length + 1, name: args.name }
        genres.push(genre)
        return genre
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use('/graphql', expressGraphQL.graphqlHTTP({
  schema: schema,
  graphiql: true
}))
app.listen(5000, () => console.log('Server Running'))