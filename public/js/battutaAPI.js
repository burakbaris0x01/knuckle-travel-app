$(document).ready(async function() {
  const countrySelect = $('#country')
  const regionSelect = $('#region')
  const citySelect = $('#city')
  const locationLabel = $('#location')
  let locations = []

  const resetSelect = (select, label) => {
    select.empty().append(`<option value="">-- ${label} --</option>`)
  }

  const selectedCountry = () => locations.find((country) => country.code === countrySelect.val())
  const selectedRegion = () => selectedCountry()?.regions.find((region) => region.name === regionSelect.val())
  const selectedCity = () => selectedRegion()?.cities.find((city) => city.name === citySelect.val())

  const populateCountries = () => {
    resetSelect(countrySelect, 'Country')
    locations.forEach((country) => {
      countrySelect.append(`<option value="${country.code}">${country.name}</option>`)
    })
  }

  const populateRegions = () => {
    resetSelect(regionSelect, 'Region')
    resetSelect(citySelect, 'City')
    locationLabel.empty()

    const country = selectedCountry()
    if (!country) return

    country.regions.forEach((region) => {
      regionSelect.append(`<option value="${region.name}">${region.name}</option>`)
    })
  }

  const populateCities = () => {
    resetSelect(citySelect, 'City')
    locationLabel.empty()

    const region = selectedRegion()
    if (!region) return

    region.cities.forEach((city) => {
      citySelect.append(`<option value="${city.name}" data-lat="${city.lat}" data-long="${city.long}">${city.name}</option>`)
    })
  }

  const updateLocationLabel = () => {
    const country = selectedCountry()
    const region = selectedRegion()
    const city = selectedCity()

    if (!country || !region || !city) {
      locationLabel.empty()
      return
    }

    locationLabel.text(`Location: Country: ${country.name}, Region: ${region.name}, City: ${city.name}`)
  }

  try {
    locations = await fetch('/data/locations.json').then((res) => {
      if (!res.ok) throw new Error('Could not load local locations.')
      return res.json()
    })
    populateCountries()
  } catch (error) {
    alerts('danger', 'Location list could not be loaded.')
  }

  countrySelect.on('change', populateRegions)
  regionSelect.on('change', populateCities)
  citySelect.on('change', updateLocationLabel)
})
