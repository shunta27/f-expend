<template>
  <div class="main">
    <b-loading :is-full-page="isFullPage" :active.sync="isLoading" :can-cancel="false"></b-loading>
    <section class="section">
      <div class="container">
        <h1 class="title">CSV Upload</h1>
        <b-field class="file">
          <b-upload
            v-model="file">
              <a class="button is-info">
                <b-icon icon="upload"></b-icon>
                <span>Click to upload</span>
              </a>
          </b-upload>
          <div class="file-name" v-if="file">
            {{ file.name }}
          </div>
        </b-field>
        <b-field>
          <button
            class="button is-primary"
            @click="onUploadSubmit">
            Upload Start
          </button>
        </b-field>
      </div>
    </section>
  </div>
</template>

<script>
import Axios from 'axios'

export default {
  data: () => {
    return {
      isLoading: false,
      isFullPage: true,
      file: null
    }
  },
  methods: {
    async onUploadSubmit () {
      const form = new FormData()
      form.append('file', this.file)
      try {
        this.isLoading = true
        const res = await Axios.post(
          'https://f-expend.firebaseapp.com/api/csv_fileupload',
          form
        )
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        const {
          status,
          statusText
        } = error.response
        console.log(`Error! HTTP Status: ${status} ${statusText}`)
      }
    }
  }
}
</script>
