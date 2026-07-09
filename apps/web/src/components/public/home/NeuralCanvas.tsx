'use client'

import { useEffect, useRef } from 'react'

interface Node {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    pulse: number
}

export function NeuralCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number | undefined>(undefined)
    const nodesRef = useRef<Node[]>([])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const getNeuralColor = () => {
            if (typeof window === 'undefined') return '0, 212, 170'
            const computedStyle = getComputedStyle(document.documentElement)
            return computedStyle.getPropertyValue('--neural-color').trim() || '0, 212, 170'
        }

        const initNodes = () => {
            const nodes: Node[] = []
            const numNodes = Math.floor((canvas.width * canvas.height) / 25000)

            for (let i = 0; i < numNodes; i++) {
                nodes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1,
                    pulse: Math.random() * Math.PI * 2,
                })
            }
            nodesRef.current = nodes
        }

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initNodes()
        }

        const drawNetwork = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const neuralColor = getNeuralColor()
            const nodes = nodesRef.current

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x
                    const dy = nodes[i].y - nodes[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < 150) {
                        const opacity = (1 - dist / 150) * 0.15
                        ctx.beginPath()
                        ctx.moveTo(nodes[i].x, nodes[i].y)
                        ctx.lineTo(nodes[j].x, nodes[j].y)
                        ctx.strokeStyle = `rgba(${neuralColor}, ${opacity})`
                        ctx.lineWidth = 1
                        ctx.stroke()
                    }
                }
            }

            // Draw nodes
            nodes.forEach((node) => {
                node.pulse += 0.02
                const pulseSize = Math.sin(node.pulse) * 0.5 + 1

                ctx.beginPath()
                ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${neuralColor}, 0.6)`
                ctx.fill()

                // Glow effect
                const gradient = ctx.createRadialGradient(
                    node.x,
                    node.y,
                    0,
                    node.x,
                    node.y,
                    node.radius * 4
                )
                gradient.addColorStop(0, `rgba(${neuralColor}, 0.2)`)
                gradient.addColorStop(1, `rgba(${neuralColor}, 0)`)
                ctx.beginPath()
                ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()
            })
        }

        const updateNodes = () => {
            const nodes = nodesRef.current
            nodes.forEach((node) => {
                node.x += node.vx
                node.y += node.vy

                if (node.x < 0 || node.x > canvas.width) node.vx *= -1
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1
            })
        }

        const animate = () => {
            updateNodes()
            drawNetwork()
            animationRef.current = requestAnimationFrame(animate)
        }

        resizeCanvas()
        animate()

        window.addEventListener('resize', resizeCanvas)

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
        />
    )
}
