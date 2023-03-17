export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`
    
    return fetch(endpoint)
    .then(data => data.json())
    .then(({login, name, public_repos, followers }) => ({
      login,
      name,
      public_repos,
      followers
    }))
  }
}


export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root) 
    this.load()

    
  }

  async add(username) {
    try {
      
      const userExist = this.entries.find(entry => entry.login === username)

      if(userExist) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined){
        throw new Error('Usuário não encontrado')
      }


      this.entries = [user, ...this.entries]
      this.update()
      this.isboxEmpty()
      this.save()

    }catch(error) {
      alert(error.message)
    }

  }

  load() {
    this.entries = JSON.parse(localStorage
      .getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  delete(user) {
    this.entries = this.entries
    .filter(entry => user.login != entry.login)

    this.update()
    this.isboxEmpty()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    
    this.tbody = this.root.querySelector('table tbody')
    this.input = this.root.querySelector('#inputSearch')

    this.update()
    this.onAdd()
    this.isboxEmpty() 
  }

  isboxEmpty() {
    const boxEmpty = this.root.querySelector('.boxEmpty')
    const table = this.root.querySelector('.table')

    if(this.entries.length == 0) {
      boxEmpty.classList.remove('hide')
      table.classList.add('isEmpty')
      table.classList.remove('noEmpty')
    } else if(this.entries.length > 0) {
      boxEmpty.classList.add('hide')
      table.classList.remove('isEmpty')
      table.classList.add('noEmpty')
    }
  }

  onAdd() {
    const btnAdd = this.root.querySelector('.search button')
    btnAdd.onclick = () => {
      this.add(this.input.value)
    }
  }

  update() {
    this.input.value = ''
    this.input.focus()
    this.removeAllTr()
    

    this.entries.map( user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.login}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user a p').textContent = user.name
      row.querySelector('.user a span').textContent = user.name
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar este usuário?')
        if(isOk) {
          this.delete(user)
        }
      }
      

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')
    
    tr.innerHTML = `
      <td class="user">
      <img src="https://github.com/maykbrito.png" alt="Imagem de maykbrito">
      <a href="https://github.com/maykbrito" target="_blank">
        <p>Mayk Brito</p>
        <span>maykbrito</span>
      </a>
      </td>
      <td class="repositories">
        76
      </td>
      <td class="followers">
        9589
      </td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `
    return tr
  }

  

  removeAllTr() {

    this.tbody.querySelectorAll('tr').forEach( (tr) => {
      tr.remove()
    })
  }

}
