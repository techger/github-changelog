var app = new Vue({
	el: '#app',
	data: {
		user: '',
		repo: '',
		milestone: '',
		repos: [],
		milestones: [],
		issues: [],
		format: 'markdown'
	},
	watch: {
		user: function (val) {
			this.loadRepos();
		},
		repo: function (val) {
			this.loadMilestones();
		},
		milestone: function (val) {
			this.loadIssues();
		}
	},
	methods: {
		switchFormat: function() {
			if ( 'HTML' === this.format ) {
				this.format = 'markdown';
			} else {
				this.format = 'HTML';
			}
		},
		loadRepos: function() {
			fetch( 'https://api.github.com/users/' + this.user + '/repos' )
				.then( ( response ) => {
					if ( 422 === response.status ) {
						alert( 'Error!' );
						return [];
					}
					return response.json();
				})
				.then( ( repoJson ) => {
					let returnedRepos = [];
					repoJson.forEach(repo => {
						returnedRepos.push( repo.name );
					});
					this.repos = returnedRepos;
				});
		},
		loadMilestones: function() {
			fetch( 'https://api.github.com/repos/' + this.user + '/' + this.repo + '/milestones?state=all&per_page=50&direction=desc' )
				.then( ( response ) => {
					if ( 422 === response.status ) {
						alert( 'Error!' );
						return [];
					}
					return response.json();
				})
				.then( ( milestoneJson ) => {
					let returnedMilestones = [];
					milestoneJson.forEach(milestone => {
						returnedMilestones.push( { id: milestone.number, name: milestone.title } );
					});
					this.milestones = returnedMilestones;
				});
		},
		loadIssues: function() {
			fetch( 'https://api.github.com/repos/' + this.user + '/' + this.repo + '/issues?milestone=' + this.milestone + '&state=all' )
				.then( ( response ) => {
					if ( 422 === response.status ) {
						alert( 'Error!' );
						return [];
					}
					return response.json();
				})
				.then( ( issueJson ) => {
					let returnedIssues = [];
					issueJson.forEach(issue => {
						if ( ! issue.hasOwnProperty( 'pull_request' ) ) {
							if ( 'closed' === issue.state ) {
								let label = '';
								if ( 0 < issue.labels.length ) {
									label = issue.labels[0].name;
								}
								returnedIssues.push({
									id: issue.number,
									title: issue.title,
									url: issue.url,
									label: label
								});
							}
						}
					});
					this.issues = returnedIssues;
				});
		}
	},
	mounted: function() {
		this.loadIssues();
	}
});

Vue.component( 'issue', {
	props: ['issue', 'format'],
	template: `<div class="issue"><span v-if="'markdown' == format">* Closed {{issue.label}}: {{issue.title}} ([Issue #{{issue.id}}]({{issue.url}}))</span>
	<li v-else class="fixed"><span class="two">Closed {{issue.label}}</span> {{issue.title}} <a v-bind:href="issue.url" target="_blank">Issue #{{issue.id}}</a></li></div>`
});