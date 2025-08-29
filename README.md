<p align="center">
  <img src="./public/logo.png" lt="Logo" width="65" />
<p>

# Gold Fish Bowl

<p align="center">
  <a href="https://shirsendu-bairagi.betteruptime.com">
    <img src="https://uptime.betterstack.com/status-badges/v3/monitor/10aqw.svg" alt="uptime status">
  </a>
</p>

![Landing](public/previews/landing.webp)

> Locality‑focused, talent marketplace marketplace where models, makeup artist, designer etc can be found for commercial shoot

- 📦 SSR
- 🖼️ OG Tags
- 🚀 PWA
- ✋ Push Notification
- 🌙 Light/Dark Mode
- 🐋 Containerized
- 🪄 CI/CD (Github Action)
- 🎭 Authentication (OAuth 2.0)
- ⚡️ API Route Caching
- 📐 Analytics

# Todo

- [ ] Add Testing

## External Dependencies

- gitleaks

## How to Deploy

1. Initialize Swarm on the Manager Node

```bash
docker swarm init --advertise-addr <MANAGER-IP>
```

2. Join Worker Nodes to the Swarm

```bash
docker swarm join --token <WORKER-TOKEN> <MANAGER-IP>:2377
```

3. Check Node Status

```bash
docker node ls
```

4. Create a docker volume

```bash
upload static, .data, .env.prod into /root/gold-fish-bowl
```

5. Use Docker Stack to deploy multi-container application

```bash
docker stack deploy --compose-file docker-compose.prod.yml gold-fish-bowl
```

6. Scale service

```bash
docker service scale gold-fish-bowl_app=2
```

7. Verify

```bash
docker service ls
docker service ps gold-fish-bowl_app
```

## License

Published under the [GNU GPLv3](https://github.com/Algostract/gold-fish-bowl/blob/main/LICENSE) license.
<br><br>
<a href="https://github.com/Algostract/gold-fish-bowl/graphs/contributors">
<img src="https://contrib.rocks/image?repo=Algostract/gold-fish-bowl" />
</a>
