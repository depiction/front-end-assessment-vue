<template>
	<div id="app" class="page-wrapper">
		<header>
			<h1>{{title}}</h1>
		</header>

		<launch-table />

		<div class="rocket"></div>
	</div>
</template>

<script>
import LaunchTable from './components/launch-table/launch-table'

export default {
	name: 'App',
	components: {
		LaunchTable
	},
	data () {
		return {
			title: 'SpaceX Launches'
		}
	}
}
</script>

<style src="./scss/styles.scss" lang="scss">
