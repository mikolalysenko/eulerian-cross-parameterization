function binId (point, radius) {
  const result = []
  for (var i = 0; i < point.length; ++i) {
    result.push(Math.floor(0.5 * point[i] / radius))
  }
  return result.join()
}

function distance (p, q) {
  let result = 0
  for (let i = 0; i < p.length; ++i) {
    result += Math.pow(p[i] - q[i], 2)
  }
  return Math.sqrt(result)
}

function dot (a, b) {
  let result = 0
  for (let i = 0; i < a.length; ++i) {
    result += a[i] * b[i]
  }
  return result
}

function weight (d, radius, a, b) {
  return Math.max(0, dot(a, b)) / Math.exp(10.0 * (d - 0.9 * radius))
}

module.exports = function (
  fromPosition, fromNormal,
  toPosition, toNormal,
  radius) {
  const dimension = fromPosition[0].length

  // store points in bins
  const bins = {}
  for (let i = 0; i < fromPosition.length; ++i) {
    const id = binId(fromPosition[i], radius)
    if (bins[id]) {
      bins[id].push(i)
    } else {
      bins[id] = [i]
    }
  }

  // calculate weights
  const entries = []
  const idVec = new Array(dimension)
  for (let i = 0; i < toPosition.length; ++i) {
    const p = toPosition[i]
    const startOffset = entries.length
    let totalWeight = 0
    for (let j = 0; j < 1 << dimension; ++j) {
      for (let k = 0; k < dimension; ++k) {
        const x = 0.5 * p[k] / radius
        const ix = Math.floor(x)
        if (j & (1 << k)) {
          if (x - ix < 0.5) {
            idVec[k] = ix - 1
          } else {
            idVec[k] = ix + 1
          }
        } else {
          idVec[k] = ix
        }
      }
      const id = idVec.join()
      const bin = bins[id]
      if (bin) {
        for (let k = 0; k < bin.length; ++k) {
          const n = bin[k]
          const q = fromPosition[k]
          const d = distance(p, q)
          if (distance < radius) {
            const w = weight(d, radius, toNormal[i], fromNormal[n])
            totalWeight += w
            entries.push([i, n, w])
          }
        }
      }
    }
    for (let j = startOffset; j < entries.length; ++j) {
      entries[j][2] /= totalWeight
    }
  }

  return entries
}
