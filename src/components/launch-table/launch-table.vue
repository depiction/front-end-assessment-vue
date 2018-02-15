<template>
	<div>
		<template v-if="loaded">
			<template v-if="launches.length && !serviceError">
				<div class="table-actions">
					<button type="button" class="refresh" @click="getLaunches(true)">Refresh</button>
					<p class="notification" :class="{ show: showNotification }">Updated</p>
					<form class="filters">
						<label class="custom-checkbox" v-for="(list, key) in filterOptions" :key="key">
							<input type="checkbox" :value="list.value" @change="updateFilters(list, $event)">{{list.name}}
							<span class="checkmark"></span>
						</label>
					</form>
					<p class="showing">
						<span v-if="filteredLaunches">Showing {{filteredLaunches.length}} of</span>
						{{this.launches.length}} launches</p>
				</div>
				<table class="launch-table">
					<thead>
						<th>Badge</th>
						<th>Rocket Name</th>
						<th>Rocket Type</th>
						<th class="launch-date" :class="sortOrder" @click="toggleSort">Launch Date</th>
						<th>Details</th>
						<th>ID</th>
						<th>Article</th>
					</thead>
					<tbody>
						<tr v-for="(launch, flight_number) in launchData" :key="flight_number">
							<td data-label="Badge" class="badge">
								<img :data-src="launch.links.mission_patch" v-if="launch.links.mission_patch" v-lazy-load />
							</td>
							<td data-label="Rocket Name">{{launch.rocket.rocket_name}}</td>
							<td data-label="Rocket Type">{{launch.rocket.rocket_type}}</td>
							<td data-label="Launch Date" class="launch-date">{{launch.launch_date_local | formatDate}}</td>
							<td data-label="Details">
								<span class="ellipsis"><span>
									{{launch.details}}
								</span></span></td>
							<td data-label="ID">{{launch.flight_number}}</td>
							<td data-label="Article" class="article">
								<a class="link" :href="launch.links.article_link" target="_blank" v-if="launch.links.article_link">
									Link
								</a>
							</td>
						</tr>
					</tbody>
				</table>
			</template>
		</template>

		<p class="message" v-if="loaded && !launches.length && !serviceError">No launches found.</p>

		<p class="message error" v-if="serviceError">Error getting launch data.</p>
	</div>
</template>

<script>
import axios from 'axios'
import orderBy from 'lodash/orderBy'

export default {
	name: 'LaunchTable',
	data () {
		return {
			launches: [],
			filteredLaunches: [],
			showNotification: false,
			sortOrder: 'desc',
			loaded: false,
			serviceError: false,
			filterOptions: [
				{
					name: 'Land Success',
					value: 'launch_success'
				},
				{
					name: 'Reused',
					value: 'reused'
				},
				{
					name: 'With Reddit',
					value: 'reddit'
				}
			],
			checkedFilters: []
		}
	},
	created () {
		this.getLaunches();
	},
	computed: {
		launchData: function() {
			return (this.filteredLaunches) ? this.filteredLaunches : this.launches;
		}
	},
	methods: {
		getLaunches (notify = false) {
			axios.get('https://api.spacexdata.com/v2/launches')
				.then(res => {
					this.loaded = true;
					this.launches = orderBy(res.data, 'launch_date_local', this.sortOrder);
					this.showNotification = (notify) ? true : false;
					this.filteredLaunches = this.filter(this.launches, this.checkedFilters);

					if (notify) {
						setTimeout(() => {
							this.showNotification = false;
						}, 1500);
					}

				})
				.catch(e => {
					this.serviceError = true;
				})
		},

		toggleSort () {
			this.sortOrder = (this.sortOrder === 'asc') ? 'desc' : 'asc';
			this.launches = orderBy(this.launches, 'launch_date_local', this.sortOrder);

			if(this.filteredLaunches) {
				this.filteredLaunches = orderBy(this.filteredLaunches, 'launch_date_local', this.sortOrder);
			}
		},

		updateFilters(option, event) {
			if (event.target.checked) {
				this.checkedFilters.push(option.value);
			} else {
				this.filterOptions.forEach((item, index) => {
					if (this.checkedFilters[index] == option.value) {
						this.checkedFilters.splice(index, 1);
					}
				})
			}

			this.filteredLaunches = this.filter(this.launches, this.checkedFilters);
		},

		filter (launches, checkedFilters) {
			if(checkedFilters.length) {
				return this.launches.filter(launch => {
					let matches = [];

					for(let filter of checkedFilters) {
						if(filter === 'launch_success') {
							if(launch.launch_success) {
								matches.push(true);
							}
						}

						if(filter === 'reused') {
							if(Object.values(launch.reuse).includes(true)) {
								matches.push(true);
							}
						}

						if(filter === 'reddit') {
							// convert links object keys into an array
							const links = Object.keys(launch.links);
							let match;

							// set match to true if launch has at least one reddit link prop that isn't null
							for(let link of links) {
								if(link.search(/reddit/i) === 0) {
									if(launch.links[link] != null) {
										match = true;
									}
								}
							}

							if(match) {
								matches.push(true);
							}
						}
					}

					return (matches.length === checkedFilters.length);
				});
			} else {
				return null;
			}
		}
	}
}
</script>

<style lang="scss" scoped>
	@import './launch-table.scss';
</style>
