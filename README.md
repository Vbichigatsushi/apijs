# apijs

POST => http://localhost:3000/register

{
    "email": "testtesttest@test.com",
    "password": "1234"
}


POST => http://localhost:3000/login 

{
    "email": "testtesttest@test.com",
    "password": "1234"
}


GET => http://localhost:3000/profile //bien mettre le token dans le bearer


POST => http://localhost:3000/articles //bien mettre le token dans le bearer

{
    "title": "article de test 2eme version",
    "content": "ceci est un contenu de test encore plus long que le precedent !",
    "publicationdate": "2025-06-04"
}


GET => http://localhost:3000/articles/{mettre un id en regardant dans dbeaver par exemple} //pas besoin de token


GET => http://localhost:3000/articles //pas besoin de token



seul le login et le profile ont une page front le reste doit etre testé avec postman