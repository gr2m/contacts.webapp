hoodie = new Hoodie("http://test.dev/_api")

App = {
	init : function() {
		this.setElements()
		this.bindToEvents()

		this.setMode('contacts')

		this.bootstrap()
	},

	setMode : function (mode) {
		this.mode = 'contacts'
		this.$el.attr('data-mode', mode)
		this.$title.text(mode)
	},

	// 
	setElements : function() {
		this.$el = $('body')
		this.$title = this.$el.find('#drawer > header h1')
		this.$searchInput = this.$el.find('.contacts input[type=search]')
		this.$contactEditDialog = this.$el.find('form[role="dialog"].contact-edit')
		this.$contactList = this.$el.find('ul.contact-list')
		this.$contactDetailContainer = this.$el.find('.contact-detail')
	},

	// 
	bootstrap : function() {
		hoodie.store.findAll('contact').then( this.renderContacts )

		hoodie.store.on('change', function(contact) {
			this.$contactDetailContainer.data('id', contact.id)
			this.showContact({target: this.$contactDetailContainer[0]})
			this.renderContacts()
		}.bind(this))
	},

	// 
	renderContacts : function(contacts) {
		var html = ''
		contacts.forEach( function (contact) {
			html +=	'<li data-id="'+contact.id+'">'
			if (contact.email) {
				try {
				html +=	'<img src="http://www.gravatar.com/avatar/'+md5(contact.email)+'">'
				} catch (e) {}
			}
			html +=	'<span>'+contact.name+'</span>'
			html +=	'</li>'
		})
		this.$contactList.html(html)
	},

	// 
	bindToEvents : function() {
		this.$el.on('click', '.changeMode a', this.changeMode)
		this.$el.on('click', '[data-action=cancel]', this.cancelCurrentAction)
		this.$el.on('click', '[data-action=add-contact]', this.editContact)
		this.$el.on('click', '[data-action=back]', this.backToHome)
		this.$el.on('click', '[data-action=edit-contact]', this.editContact)
		this.$el.on('click', '.contact-list li', this.showContact)
		this.$el.on('submit', 'form', this.handleSubmit)
		this.$searchInput.on('input', this.search)
	},

	changeMode : function(event) {

		var $el = $(event.target)
		var mode = $el.attr('href').substr(1)
		
		this.setMode( mode )
	},

	search : function (event) {
		
	},

	showContact : function(event) {
		var id = $(event.target).data('id')
		this.setMode('contact-detail')
		var $cont = this.$contactDetailContainer
		this.$contactDetailContainer.find('button').data('id', id)

		console.log($(event.target))
		console.log(id)
		hoodie.store.find('contact', id).then( function(contact) {
				
			$cont.find('var').each( function() {
				$(this).text( contact[$(this).attr('name')] || '')
			});
		})
		
		
	},

	addContact : function (event) {
		this.$contactEditDialog.show()
	},

	editContact : function (event) {
		var id = $(event.target).data('id')
		var $dialog = this.$contactEditDialog
		$dialog.show()
		$dialog.data('id', id)

		if (id) {
			hoodie.store.find('contact', id).then( function(contact) {
				$dialog.find('input').each( function() {
					this.value = contact[this.name]
				})
			});
		}
	},

	cancelCurrentAction : function(event) {
		$container = $(event.target).closest('[role=dialog]')
		$container.hide()
	},

	handleSubmit: function(event, bzd) {
		event.preventDefault()

		var $form = $(event.target).closest('form')
		var id = $form.data('id')
		var modelName = $form.data('model')
		var data = {}
		$form.find('[name]').each( function() {
			data[this.name] = this.value
		}).val('');

		if (id) {
			window.p = hoodie.store.update(modelName, id, data)
		} else {
			hoodie.store.add(modelName, data)	
		}
		

		if ($form.is('[role=dialog]')) {
			$form.hide()
		}
	},

	backToHome: function(event) {
		this.setMode('contacts')
	}
}

// bindings
__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },

App.init = __bind(App.init, App);
App.changeMode = __bind(App.changeMode, App);
App.search = __bind(App.search, App);
App.cancelCurrentAction = __bind(App.cancelCurrentAction, App);
App.handleSubmit = __bind(App.handleSubmit, App);
App.showContact = __bind(App.showContact, App);
App.renderContacts = __bind(App.renderContacts, App);
App.backToHome = __bind(App.backToHome, App);
App.editContact = __bind(App.editContact, App);

$('document').ready( App.init )