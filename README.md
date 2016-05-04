# tennu-meh

### Query the Meh.com API for daily deals

A plugin for the [tennu](https://github.com/Tennu/tennu) irc framework.

Results cached for a 60 second non-configurable limit. As per rules set by Meh.com.

### Configuration

```Javascript
"meh": {
 "env-key-name": "",
 "key": "XXXXXXXXXXXXXXXXXX"
}
```

- Set env-key-name to the env var you store your key in. Leave blank to store your key in tennu's config (not recommended)

### Usage

- ```!meh``` gets title and url
- ```!meh video``` gets deal video
- ```!meh poll``` gets poll and answers

### Installing Into Tennu

See Downloadable Plugins [here](https://tennu.github.io/plugins/).