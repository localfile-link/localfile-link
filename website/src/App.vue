<script setup lang="ts">
import './composables/dark'
import customProtocolCheck from 'custom-protocol-check'

const query = new URLSearchParams(window.location.search)
const fileInit = ref(query.get('file'))
const file = ref(fileInit.value)
const url = computed(() => `localfile://${file.value?.replace(/^file:\/\//, '')}`)
const referrer = document.referrer
const isSupported = ref<boolean | null>()
let refererUrl: URL | undefined

try {
  if (referrer && referrer !== location.href)
    refererUrl = new URL(referrer)
}
catch (e) {
}

watch(file, () => {
  if (file.value)
    query.set('file', file.value)
  else
    query.delete('file')
  history.replaceState(null, '', `${location.pathname}?${query}`)
})

function copyPath() {
  if (file.value)
    navigator.clipboard.writeText(file.value)
}

function reload() {
  location.reload()
}

onMounted(() => {
  if (file.value) {
    customProtocolCheck(
      url.value,
      () => {
        isSupported.value = false
      },
      () => {
        isSupported.value = true
        try {
          window.close()
        }
        catch (e) {
          console.error('Failed to selfclose')
        }
      },
    )
  }
})
</script>

<template>
  <div h-full w-full font-sans grid="~ cols-[1fr_2fr]">
    <div flex="~ col gap-1 items-end justify-center" bg-gray:5 p8>
      <div h-35 flex="~ col gap-1 items-end justify-end">
        <img src="/logo.svg" w-20 dark:invert>
        <div text-lg font-bold>
          localfile.link
        </div>
        <div mt2 text-right op50>
          Remote links to open local files<br>with your text editor.
        </div>
      </div>

      <div border="t gray/10" mb4 mt8 h-1px w-15 />

      <div flex="~ gap-3">
        <a href="https://github.com/localfile-link/localfile-link#how-it-works" target="_blank" op50 hover:underline hover:op100>
          How this work?
        </a>
        <a href="https://github.com/localfile-link/localfile-link" target="_blank" op50 hover:underline hover:op100>
          GitHub
        </a>
      </div>
    </div>

    <div flex="~ col gap-1 justify-center" rounded-lg p8>
      <div h-35 flex="~ col gap-2 justify-end items-start">
        <template v-if="fileInit">
          <div op75>
            Opening file <template v-if="refererUrl">
              by <span text-teal-4>{{ refererUrl.origin }}</span>
            </template>
            ...
          </div>

          <a :href="url" text-5xl decoration-offset-4 hover:underline break-all>{{ file }}</a>

          <div mb--6 flex="~ gap-2">
            <button op25 hover:op100 @click="copyPath()">
              copy
            </button>
            <button op25 hover:op100 @click="fileInit = ''">
              reset
            </button>
          </div>
        </template>
        <template v-else>
          <div op75>
            Enter file path:
          </div>
          <input
            v-model="file"
            placeholder="/path/to/file:line:col"
            border="~ gray/10 rounded"
            bg-gray:5 p2 text-3xl w-full
            @keydown.enter="reload()"
          >
        </template>
      </div>

      <div border="t gray/10" mb4 mt8 h-1px w-15 />

      <p>
        <span :class="isSupported === false ? 'text-amber-5' : 'op50'">Link doesn't work? Install the client app first:</span>
        <a href="https://github.com/localfile-link/localfile-link/releases" target="_blank" ml1 font-bold decoration-offset-4 op75 hover:underline hover:op100>Download</a>
      </p>
    </div>
  </div>
</template>
